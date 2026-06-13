import { createHash, randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { JOSEError } from "jose/errors";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { db, usersTable } from "@workspace/db";
import { env } from "../lib/env";
import { authLimiter } from "../middlewares/rate-limit";

const router = Router();

/**
 * Apple's public JWKS — cached at module load, auto-refreshed by jose on
 * key rotation.  Source: https://appleid.apple.com/auth/keys
 */
const appleJWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);

/**
 * Accepted Apple audience values.
 * Supports a comma-separated list so Expo Go ("host.exp.exponent") and the
 * production bundle ("com.payvora.mobile") can both be accepted at the same time.
 */
const appleAudiences: string[] = env.APPLE_BUNDLE_ID
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function verifyAppleIdToken(
  identityToken: string,
  rawNonce: string,
): Promise<{ sub: string; email?: string }> {
  const { payload } = await jwtVerify(identityToken, appleJWKS, {
    issuer: "https://appleid.apple.com",
    audience: appleAudiences.length === 1 ? appleAudiences[0] : appleAudiences,
    algorithms: ["RS256"],
  });

  if (!payload.sub) throw new Error("Apple identity token missing sub claim");

  const expectedNonceHash = createHash("sha256").update(rawNonce).digest("hex");
  if (payload.nonce !== expectedNonceHash) {
    throw Object.assign(
      new Error("Apple identity token nonce mismatch"),
      { code: "ERR_NONCE_MISMATCH" },
    );
  }

  return { sub: payload.sub, email: payload.email as string | undefined };
}

function signToken(userId: string, email: string, name: string): string {
  return jwt.sign({ userId, email, name }, env.JWT_SECRET, { expiresIn: "7d" });
}

// ──────────────────────────────────────────────────────────────────────────────
// Server-side Google OAuth flow (for Expo Go native — proxy approach removed
// in expo-auth-session v7 / SDK 54).
//
// Flow:
//  1. Native app: WebBrowser.openAuthSessionAsync(initUrl, returnUrl)
//  2. GET /api/auth/google/init  → redirects to Google with server callback URI
//  3. Google → GET /api/auth/google/callback (code exchange, user lookup)
//  4. Callback redirects to returnUrl (exp://...) with JWT + user params
//  5. expo-web-browser intercepts the exp:// redirect and resolves the promise
// ──────────────────────────────────────────────────────────────────────────────

// ── Stateless signed OAuth state ─────────────────────────────────────────────
// Encodes returnUrl into a short-lived signed JWT so no server-side storage is
// needed.  Safe across Railway container restarts and horizontal scaling because
// any replica can verify using the shared JWT_SECRET env var.

function createOAuthState(returnUrl: string): string {
  return jwt.sign(
    { returnUrl, jti: randomBytes(12).toString("hex") },
    env.JWT_SECRET,
    { expiresIn: "10m", noTimestamp: false },
  );
}

function verifyOAuthState(state: string): { returnUrl: string } | null {
  try {
    const payload = jwt.verify(state, env.JWT_SECRET) as { returnUrl: string };
    if (typeof payload.returnUrl !== "string") return null;
    return { returnUrl: payload.returnUrl };
  } catch {
    return null;
  }
}

/**
 * Return the backend's public HTTPS callback URL for Google OAuth.
 *
 * IMPORTANT: do NOT derive from req.get("host") in this project because
 * dev-proxy.cjs (port 5000 → 3000) overwrites the Host header with
 * "127.0.0.1:3000", which would produce the wrong callback URL.
 *
 * Resolution order:
 *  1. GOOGLE_CALLBACK_URL env var (explicit, always correct)
 *  2. X-Forwarded-Host header (set by Replit's outer TLS proxy)
 *  3. Host header fallback (works in production where Host is correct)
 */
function buildCallbackUrl(req: Parameters<Parameters<typeof router.get>[1]>[0]): string {
  if (env.GOOGLE_CALLBACK_URL) return env.GOOGLE_CALLBACK_URL;
  const forwardedHost = req.get("x-forwarded-host");
  const host          = forwardedHost ?? req.get("host") ?? "localhost:3000";
  const proto         = req.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? req.protocol;
  return `${proto}://${host}/api/auth/google/callback`;
}

/**
 * GET /api/auth/google/init?returnUrl=exp://...
 *
 * Saves a short-lived state token, then redirects to Google's authorization
 * endpoint.  The redirect_uri points to our own callback route.
 *
 * Required Google Cloud Console configuration:
 *   Authorized Redirect URI: https://<your-domain>/api/auth/google/callback
 */
router.get("/auth/google/init", (req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(503).send("Google OAuth is not configured on this server.");
    return;
  }

  const returnUrl = (req.query.returnUrl as string | undefined) ?? "";
  if (!returnUrl) {
    res.status(400).send("Missing required query param: returnUrl");
    return;
  }

  const state = createOAuthState(returnUrl);

  const callbackUrl = buildCallbackUrl(req);
  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  callbackUrl,
    response_type: "code",
    scope:         "openid profile email",
    state,
    access_type:   "online",
    prompt:        "select_account",
  });

  console.log(`[auth/google/init] Initiating OAuth — callback: ${callbackUrl}`);
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

/**
 * GET /api/auth/google/callback
 *
 * Handles the authorization-code redirect from Google.
 * Exchanges the code for an access token, looks up / creates the user,
 * then redirects to the app's returnUrl with token + user params appended.
 */
router.get("/auth/google/callback", async (req, res) => {
  const { code, state, error } = req.query as Record<string, string>;

  const stored = verifyOAuthState(state ?? "");
  if (!stored) {
    res.status(400).send(
      "<!DOCTYPE html><html><body>" +
      "<p>Session expired. Please close this window and try signing in again.</p>" +
      "</body></html>",
    );
    return;
  }

  const { returnUrl } = stored;

  // User denied or Google returned an error
  if (error) {
    console.warn(`[auth/google/callback] Google returned error: ${error}`);
    res.redirect(`${returnUrl}?error=${encodeURIComponent(error)}`);
    return;
  }

  if (!code) {
    res.redirect(`${returnUrl}?error=${encodeURIComponent("no_code")}`);
    return;
  }

  try {
    const callbackUrl = buildCallbackUrl(req);

    // ── Step 1: exchange authorization code for access token ─────────────────
    console.log("[auth/google/callback] Exchanging authorization code…");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        code,
        client_id:     env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  callbackUrl,
        grant_type:    "authorization_code",
      }),
    });

    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      error?:        string;
      error_description?: string;
    };

    if (!tokenRes.ok || !tokens.access_token) {
      const msg = tokens.error_description ?? tokens.error ?? "token_exchange_failed";
      console.error(`[auth/google/callback] Token exchange failed: ${msg}`);
      res.redirect(`${returnUrl}?error=${encodeURIComponent(msg)}`);
      return;
    }

    // ── Step 2: fetch the user profile ───────────────────────────────────────
    console.log("[auth/google/callback] Fetching user profile…");
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      const msg = "failed_to_fetch_user";
      console.error(`[auth/google/callback] Userinfo fetch failed: ${userRes.status}`);
      res.redirect(`${returnUrl}?error=${encodeURIComponent(msg)}`);
      return;
    }

    const googleUser = (await userRes.json()) as {
      sub:      string;
      email:    string;
      name?:    string;
      picture?: string;
    };
    const { sub: providerId, email, name, picture } = googleUser;

    if (!email) {
      res.redirect(`${returnUrl}?error=${encodeURIComponent("no_email")}`);
      return;
    }

    console.log(`[auth/google/callback] Google user verified — ${email}`);

    // ── Step 3: find or create user ──────────────────────────────────────────
    const existing = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.provider, "google"), eq(usersTable.providerId, providerId)))
      .limit(1);

    let user = existing[0];
    if (!user) {
      console.log(`[auth/google/callback] Creating new user for ${email}…`);
      const [inserted] = await db
        .insert(usersTable)
        .values({ email, name: name ?? "", provider: "google", providerId, avatarUrl: picture })
        .onConflictDoNothing()
        .returning();
      user =
        inserted ??
        (await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1))[0];
    } else {
      console.log(`[auth/google/callback] Existing user — id: ${user.id}`);
    }

    if (!user) {
      res.redirect(`${returnUrl}?error=${encodeURIComponent("user_creation_failed")}`);
      return;
    }

    // ── Step 4: issue JWT and redirect back to the app ───────────────────────
    const token = signToken(user.id, user.email, user.name);

    const resultParams = new URLSearchParams({ token, id: user.id, email: user.email, name: user.name });
    if (user.avatarUrl) resultParams.set("avatarUrl", user.avatarUrl);

    console.log(`[auth/google/callback] ✓ JWT issued — redirecting to app`);
    res.redirect(`${returnUrl}?${resultParams}`);
  } catch (e) {
    console.error("[auth/google/callback] Unexpected error:", e);
    res.redirect(`${returnUrl}?error=${encodeURIComponent("server_error")}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// Legacy client-side Google flow (web preview uses expo-auth-session directly).
// Accepts an access_token, verifies it with Google, returns a JWT.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/auth/google", authLimiter, async (req, res) => {
  try {
    const { accessToken } = z
      .object({ accessToken: z.string().min(1) })
      .parse(req.body);

    if (env.GOOGLE_CLIENT_ID) {
      console.log("[auth/google] Verifying token audience via tokeninfo endpoint…");
      const tokenInfoRes = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
      );
      if (!tokenInfoRes.ok) {
        const body = await tokenInfoRes.text();
        console.error(`[auth/google] tokeninfo rejected token: ${tokenInfoRes.status} — ${body}`);
        res.status(401).json({ error: "Invalid Google access token" });
        return;
      }
      const tokenInfo = (await tokenInfoRes.json()) as {
        audience?: string;
        issued_to?: string;
        error?: string;
      };
      const audience = tokenInfo.audience ?? tokenInfo.issued_to ?? "";
      if (audience !== env.GOOGLE_CLIENT_ID) {
        console.error(`[auth/google] Audience mismatch — got "${audience}"`);
        res.status(401).json({ error: "Google token audience mismatch" });
        return;
      }
    }

    const gRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!gRes.ok) {
      const body = await gRes.text();
      console.error(`[auth/google] Google rejected token: ${gRes.status} — ${body}`);
      res.status(401).json({ error: "Invalid Google access token" });
      return;
    }

    const googleUser = (await gRes.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };
    const { id, email, name, picture } = googleUser;

    if (!email) {
      res.status(400).json({ error: "Google account has no email" });
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.provider, "google"), eq(usersTable.providerId, id)))
      .limit(1);

    let user = existing[0];
    if (!user) {
      const [inserted] = await db
        .insert(usersTable)
        .values({ email, name: name ?? "", provider: "google", providerId: id, avatarUrl: picture })
        .onConflictDoNothing()
        .returning();
      user =
        inserted ??
        (await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1))[0];
    }

    if (!user) {
      res.status(500).json({ error: "Failed to create user" });
      return;
    }

    const token = signToken(user.id, user.email, user.name);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    console.error("[auth/google] Unexpected error:", e);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/auth/apple", authLimiter, async (req, res) => {
  try {
    const { identityToken, nonce, fullName } = z
      .object({
        identityToken: z.string().min(1),
        nonce:         z.string().min(1, "nonce is required"),
        fullName: z
          .object({
            givenName:  z.string().optional().nullable(),
            familyName: z.string().optional().nullable(),
          })
          .optional(),
      })
      .parse(req.body);

    const claims     = await verifyAppleIdToken(identityToken, nonce);
    const providerId = claims.sub;
    const email      = claims.email ?? `apple_${providerId}@privaterelay.appleid.com`;
    const givenName  = fullName?.givenName  ?? "";
    const familyName = fullName?.familyName ?? "";
    const name       = [givenName, familyName].filter(Boolean).join(" ") || "Apple User";

    const existing = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.provider, "apple"), eq(usersTable.providerId, providerId)))
      .limit(1);

    let user = existing[0];
    if (!user) {
      const [inserted] = await db
        .insert(usersTable)
        .values({ email, name, provider: "apple", providerId })
        .onConflictDoNothing()
        .returning();
      user =
        inserted ??
        (await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1))[0];
    }

    if (!user) {
      res.status(500).json({ error: "Failed to create user" });
      return;
    }

    const token = signToken(user.id, user.email, user.name);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const code = (e as { code?: string }).code;
    if (code === "ERR_JWKS_TIMEOUT" || code === "ERR_JWKS_REQUEST_FAILED") {
      res.status(503).json({ error: "Apple authentication service unavailable. Please try again." });
      return;
    }
    if (e instanceof JOSEError || code === "ERR_NONCE_MISMATCH") {
      res.status(401).json({ error: "Invalid Apple identity token" });
      return;
    }
    console.error("/auth/apple error:", e);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/auth/signup", authLimiter, async (req, res) => {
  try {
    const { email, password, name } = z
      .object({
        email:    z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name:     z.string().min(1, "Name is required"),
      })
      .parse(req.body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(usersTable)
      .values({ email: email.toLowerCase(), name, provider: "password", providerId: passwordHash })
      .returning();

    const token = signToken(user.id, user.email, user.name);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: e.errors[0]?.message ?? "Invalid request body" });
      return;
    }
    console.error("/auth/signup error:", e);
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/auth/signin", authLimiter, async (req, res) => {
  try {
    const { email, password } = z
      .object({
        email:    z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email.toLowerCase()), eq(usersTable.provider, "password")))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.providerId))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user.id, user.email, user.name);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    console.error("/auth/signin error:", e);
    res.status(500).json({ error: "Sign in failed" });
  }
});

export default router;
