/**
 * env.ts — Single source of truth for validated environment configuration.
 *
 * Runs at process startup. If any required variable is missing or invalid the
 * process exits with a descriptive error so operators fix misconfiguration
 * immediately rather than discovering it at runtime during a request.
 *
 * Security rationale
 * ──────────────────
 * Reading raw process.env strings throughout the codebase is error-prone and
 * makes it easy to silently fall back to unsafe defaults. A single validated
 * schema catches misconfiguration early and provides typed, immutable access
 * to all configuration throughout the application.
 */

import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535, { message: "PORT must be a valid TCP port (1–65535)" }),

  DATABASE_URL: z
    .string()
    .min(1, { message: "DATABASE_URL is required" })
    .refine((v) => v.startsWith("postgres"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  /**
   * Comma-separated list of allowed CORS origins in production.
   * Example: "https://app.payvora.com,https://admin.payvora.com"
   * Leave unset in development — localhost origins are allowed automatically.
   */
  ALLOWED_ORIGINS: z.string().optional(),

  /**
   * Rate-limit window in milliseconds (default: 15 minutes).
   */
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),

  /**
   * Maximum number of requests per window for general routes (default: 100).
   */
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  /**
   * Stricter limit for auth/sensitive routes (default: 10 per window).
   */
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),

  /**
   * Express body-parser size limit string (default: 50kb).
   * Prevents DoS via extremely large JSON payloads.
   */
  BODY_SIZE_LIMIT: z.string().default("50kb"),

  /**
   * Secret used to sign and verify JWTs issued by this server.
   * Must be a long random string. Generate with:
   *   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   */
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters" }),

  /**
   * Google OAuth Web Client ID for verifying the audience of Google access tokens.
   * Required for Google Sign-In — if not set, the route returns 503.
   */
  GOOGLE_CLIENT_ID: z.string().optional(),

  /**
   * Google OAuth Web Client Secret.
   * Used for server-side authorization-code exchange.
   * Optional — only needed if the backend performs code exchange directly.
   */
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  /**
   * Apple iOS bundle ID used to verify the `aud` claim in Apple identity tokens.
   * Must match ios.bundleIdentifier in app.json.
   * Defaults to "com.payvora.mobile".
   */
  APPLE_BUNDLE_ID: z.string().default("com.payvora.mobile"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const fieldErrors = result.error.flatten().fieldErrors;
  const lines = Object.entries(fieldErrors)
    .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(", ")}`)
    .join("\n");

  console.error(
    `\n[startup] ❌  Invalid environment configuration — server will not start:\n${lines}\n`,
  );
  process.exit(1);
}

export const env = Object.freeze(result.data);

export const isDev  = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
