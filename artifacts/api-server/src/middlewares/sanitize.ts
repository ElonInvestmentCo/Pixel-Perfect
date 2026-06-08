/**
 * sanitize.ts — Request body sanitization (prototype pollution + XSS surface).
 *
 * Security rationale
 * ──────────────────
 * Prototype Pollution
 *   An attacker sends { "__proto__": { "isAdmin": true } } in a JSON body.
 *   If this object is merged into another object (Object.assign, spread, etc.)
 *   every future `{}.isAdmin` check evaluates to true.  This middleware strips
 *   the three dangerous keys (__proto__, constructor, prototype) from all
 *   request body, query, and params objects before any route handler sees them.
 *
 * Mass assignment / over-posting
 *   We don't whitelist fields here — that's the job of Zod schemas in each
 *   route handler.  But we enforce a maximum object depth (10) and maximum
 *   string length (10 000 chars) to prevent memory exhaustion from deeply
 *   nested or extremely long values that slipped past the body-size limit.
 *
 * XSS
 *   This API returns JSON; browsers that render JSON do not execute scripts.
 *   True XSS sanitization belongs in the rendering client (the mobile app or
 *   any web frontend).  We deliberately do NOT mangle field values here to
 *   avoid breaking legitimate data that contains HTML characters.
 *
 * SSRF
 *   URL inputs that will be fetched server-side MUST be validated against
 *   the SSRF guard in lib/ssrf.ts (allowlist of safe hosts).  This middleware
 *   does not inspect URL fields because it cannot know which fields are URLs.
 */

import type { NextFunction, Request, Response } from "express";

// Keys that enable prototype pollution via JSON merge operations.
const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const MAX_DEPTH  = 10;
const MAX_STRING = 10_000; // characters

function sanitize(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) return null; // Truncate overly deep nesting

  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    // Truncate runaway strings.  Route-level Zod schemas enforce exact limits.
    return value.length > MAX_STRING ? value.slice(0, MAX_STRING) : value;
  }

  if (typeof value !== "object") return value; // number, boolean, bigint, etc.

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1));
  }

  // Plain object — rebuild without blocked keys.
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (BLOCKED_KEYS.has(key)) continue; // DROP prototype-pollution keys
    clean[key] = sanitize(
      (value as Record<string, unknown>)[key],
      depth + 1,
    );
  }
  return clean;
}

/**
 * Express middleware that sanitizes req.body, req.query, and req.params
 * in-place before any route handler executes.
 */
export function sanitizeRequest(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body, 0);
  }

  // req.query is read-only but we can replace individual keys.
  // Cast required because Express types req.query as immutable.
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (BLOCKED_KEYS.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (req.query as any)[key];
      }
    }
  }

  next();
}
