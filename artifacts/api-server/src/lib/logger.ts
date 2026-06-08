/**
 * logger.ts — Structured, production-safe pino logger.
 *
 * Security rationale
 * ──────────────────
 * The redact list ensures sensitive values are NEVER written to log sinks,
 * even if accidentally passed to logger calls. This covers:
 *   - Authorization tokens (Bearer, Basic, API keys in header)
 *   - Cookie headers (session tokens, refresh tokens)
 *   - Set-Cookie response headers
 *   - Password fields in request bodies
 *   - Common secret field names in arbitrary objects
 */

import pino from "pino";
import { env, isDev } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      // HTTP headers
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "req.headers['x-auth-token']",
      "res.headers['set-cookie']",

      // Common body field names that carry secrets
      "req.body.password",
      "req.body.newPassword",
      "req.body.currentPassword",
      "req.body.confirmPassword",
      "req.body.secret",
      "req.body.token",
      "req.body.refreshToken",
      "req.body.accessToken",
      "req.body.pin",
      "req.body.ssn",
      "req.body.cardNumber",
      "req.body.cvv",

      // Top-level fields in log objects (e.g. logger.info({ password }))
      "password",
      "token",
      "secret",
      "refreshToken",
      "accessToken",
      "pin",
      "ssn",
      "cardNumber",
      "cvv",
    ],
    censor: "[REDACTED]",
  },

  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }
    : {}),
});
