/**
 * rate-limit.ts — Tiered rate limiting for all API routes.
 *
 * Security rationale
 * ──────────────────
 * Without rate limiting every unauthenticated endpoint is open to:
 *   - Brute-force credential attacks (auth routes)
 *   - Enumeration attacks (user IDs, phone numbers, emails)
 *   - DoS via request volume
 *   - API scraping
 *
 * Two tiers are defined:
 *   globalLimiter   — 100 req / 15 min per IP (all routes)
 *   authLimiter     — 10  req / 15 min per IP (login, register, OTP, reset)
 *
 * The window and max values are read from validated env vars so operators
 * can tune them without a code change.
 *
 * Proxy trust
 * ───────────
 * When deployed behind a reverse proxy (Replit, nginx, Cloudflare) the real
 * client IP arrives in X-Forwarded-For.  `app.set('trust proxy', 1)` (set in
 * app.ts) tells express-rate-limit to use that header for keying.
 * WARNING: only trust the number of proxy hops you actually control.  Trusting
 * unlimited hops allows a client to spoof their IP via X-Forwarded-For.
 */

import rateLimit, { type Options } from "express-rate-limit";
import { env } from "../lib/env";

const sharedOptions: Partial<Options> = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  standardHeaders: "draft-7",   // Return RateLimit-* headers (RFC 9110 draft)
  legacyHeaders: false,          // Disable deprecated X-RateLimit-* headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,

  // Reject with a clean JSON body — never leak internal info.
  message: {
    status: 429,
    error: "Too many requests. Please wait and try again.",
  },

  // Use a reliable key: prefer X-Forwarded-For (trusted via trust proxy),
  // fall back to the socket remote address.
  keyGenerator(req) {
    return (
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ??
      req.socket.remoteAddress ??
      "unknown"
    );
  },
};

/**
 * General API rate limiter — 100 requests per 15-minute window per IP.
 * Applied globally across all /api/* routes.
 */
export const globalLimiter = rateLimit({
  ...sharedOptions,
  max: env.RATE_LIMIT_MAX,
  handler(_req, res) {
    res.status(429).json({
      status: 429,
      error: "Rate limit exceeded. Please slow down.",
    });
  },
});

/**
 * Strict auth rate limiter — 10 requests per 15-minute window per IP.
 * Apply this to: POST /auth/login, POST /auth/register, POST /auth/otp,
 *               POST /auth/reset-password, POST /auth/verify
 */
export const authLimiter = rateLimit({
  ...sharedOptions,
  max: env.RATE_LIMIT_AUTH_MAX,
  handler(_req, res) {
    res.status(429).json({
      status: 429,
      error:
        "Too many authentication attempts. Account may be temporarily locked.",
    });
  },
});

/**
 * Convenience: skip rate limiting for health-check endpoints so load
 * balancers and uptime monitors are never blocked.
 */
export function skipHealthCheck(
  req: Parameters<Required<Options>["skip"]>[0],
): boolean {
  return req.path === "/api/healthz";
}
