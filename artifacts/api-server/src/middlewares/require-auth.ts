/**
 * require-auth.ts — JWT authentication middleware.
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the token with
 * JWT_SECRET, and attaches the decoded payload to the request object.
 *
 * Returns 401 if the header is missing, malformed, or the token is invalid/expired.
 * Use this middleware on any route that requires an authenticated user.
 */

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export interface AuthRequest extends Request {
  userId?:    string;
  userEmail?: string;
  userName?:  string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email:  string;
      name:   string;
    };

    req.userId    = payload.userId;
    req.userEmail = payload.email;
    req.userName  = payload.name;

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
