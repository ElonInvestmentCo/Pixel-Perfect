import { createHash } from "crypto";
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
 * Verify an Apple identity token per Apple's official authentication guide:
 * https://developer.apple.com/documentation/signinwithapple/
 *   authenticating-users-with-sign-in-with-apple
 *
 * Checks enforced:
 *  1. Algorithm is RS256
 *  2. iss === "https://appleid.apple.com"
 *  3. aud === bundle ID (env.APPLE_BUNDLE_ID, default "com.payvora.mobile")
 *  4. exp has not passed (automatic in jwtVerify)
 *  5. Signature is valid against Apple's live public JWKS
 *  6. nonce claim === SHA-256(rawNonce) — prevents identity token replay attacks
 */
async function verifyAppleIdToken(
  identityToken: string,
  rawNonce: string,
): Promise<{ sub: string; email?: string }> {
  const { payload } = await jwtVerify(identityToken, appleJWKS, {
    issuer: "https://appleid.apple.com",
    audience: env.APPLE_BUNDLE_ID,
    algorithms: ["RS256"],
  });

  if (!payload.sub) throw new Error("Apple identity token missing sub claim");

  // Nonce verification — the token's `nonce` claim must equal SHA-256(rawNonce)
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

router.post("/auth/google", authLimiter, async (req, res) => {
  try {
    const { accessToken } = z
      .object({ accessToken: z.string().min(1) })
      .parse(req.body);

    console.log("[auth/google] Verifying access token with Google userinfo API…");

    const gRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`[auth/google] Google userinfo status: ${gRes.status}`);

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

    console.log(`[auth/google] Google user verified — id: ${id}, email: ${email}`);

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
      console.log(`[auth/google] Creating new user for ${email}…`);
      const [inserted] = await db
        .insert(usersTable)
        .values({ email, name: name ?? "", provider: "google", providerId: id, avatarUrl: picture })
        .onConflictDoNothing()
        .returning();
      user =
        inserted ??
        (await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1))[0];
    } else {
      console.log(`[auth/google] Existing user found — id: ${user.id}`);
    }

    if (!user) {
      res.status(500).json({ error: "Failed to create user" });
      return;
    }

    const token = signToken(user.id, user.email, user.name);
    console.log(`[auth/google] ✓ JWT issued for user ${user.id} — returning to client`);
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
    // Apple JWKS endpoint unreachable — surface as 503 so clients can retry
    if (code === "ERR_JWKS_TIMEOUT" || code === "ERR_JWKS_REQUEST_FAILED") {
      res.status(503).json({ error: "Apple authentication service unavailable. Please try again." });
      return;
    }
    // Any jose crypto/validation error OR our custom nonce mismatch → 401.
    // Using instanceof JOSEError covers all current and future jose error
    // subclasses without maintaining a brittle allowlist of code strings.
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
