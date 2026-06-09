import { and, eq } from "drizzle-orm";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { db, usersTable } from "@workspace/db";
import { env } from "../lib/env";
import { authLimiter } from "../middlewares/rate-limit";

const router = Router();

function signToken(userId: string, email: string, name: string): string {
  return jwt.sign({ userId, email, name }, env.JWT_SECRET, { expiresIn: "7d" });
}

function decodeAppleIdToken(idToken: string): { sub: string; email?: string } {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid Apple identity token format");
  const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
  return JSON.parse(payload) as { sub: string; email?: string };
}

router.post("/auth/google", authLimiter, async (req, res) => {
  try {
    const { accessToken } = z
      .object({ accessToken: z.string().min(1) })
      .parse(req.body);

    const gRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!gRes.ok) {
      res.status(401).json({ error: "Invalid Google access token" });
      return;
    }
    const { id, email, name, picture } = (await gRes.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

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
    console.error("/auth/google error:", e);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/auth/apple", authLimiter, async (req, res) => {
  try {
    const { identityToken, fullName } = z
      .object({
        identityToken: z.string().min(1),
        fullName: z
          .object({
            givenName:  z.string().optional().nullable(),
            familyName: z.string().optional().nullable(),
          })
          .optional(),
      })
      .parse(req.body);

    const claims     = decodeAppleIdToken(identityToken);
    const providerId = claims.sub;
    const email      = claims.email ?? `apple_${providerId}@private.apple`;
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
