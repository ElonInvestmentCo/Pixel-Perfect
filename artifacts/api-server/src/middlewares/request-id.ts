/**
 * request-id.ts — Assigns a unique ID to every incoming request.
 *
 * Security rationale
 * ──────────────────
 * A stable, unique request ID attached at the very start of the middleware
 * chain is the foundation of secure observability:
 *
 *   - Every log line emitted by pino-http carries the ID, so you can trace
 *     a single request across thousands of log lines without relying on IP or
 *     User-Agent (both of which are trivially spoofed).
 *   - The ID is returned to the client via X-Request-Id so they can include
 *     it in support requests, eliminating "I got a 500, help me" ambiguity.
 *   - IDs are generated with crypto.randomUUID() which uses the OS CSPRNG —
 *     they are unpredictable and cannot be guessed by an attacker trying to
 *     replay or forge requests.
 *   - If the client sends their own X-Request-Id we IGNORE it and overwrite it.
 *     Accepting client-supplied IDs would allow an attacker to poison logs with
 *     arbitrary values or inject IDs that collide with legitimate requests.
 */

import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  // Augment Express Request so req.id is typed everywhere.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = randomUUID();
  req.id = id;
  // Expose to client for correlation (support tickets, mobile crash reports).
  res.setHeader("X-Request-Id", id);
  next();
}
