/**
 * security.ts — Helmet headers + hardened CORS + body-size limits.
 *
 * Security rationale
 * ──────────────────
 * Helmet sets ~14 HTTP response headers that defend against well-known
 * browser-side attacks (XSS via CSP, clickjacking via X-Frame-Options,
 * MIME sniffing via X-Content-Type-Options, etc.).  Even for an API-only
 * server that returns JSON, setting these headers costs nothing and prevents
 * edge cases where a misconfigured client renders a response as HTML.
 *
 * CORS is locked to an explicit origin allowlist.  The wildcard "*" default
 * that ships with the `cors` package is dangerous for credentialed requests
 * and unacceptable for a financial API.
 *
 * Body size limits prevent Denial-of-Service through oversized payloads.
 * express.json() has no limit by default — a 1 GB body would be fully
 * buffered into memory before any route handler runs.
 */

import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env, isDev } from "../lib/env";

// ─── CORS origin allowlist ─────────────────────────────────────────────────
// Development: allow localhost on any port + Expo tunnel subdomains.
// Production:  only explicitly listed origins from ALLOWED_ORIGINS env var.
const devOrigins: (string | RegExp)[] = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.exp\.direct$/,          // Expo Go tunnel
  /\.exp\.host$/,            // Expo legacy tunnel
];

const prodOrigins: (string | RegExp)[] = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins: (string | RegExp)[] = isDev
  ? devOrigins
  : prodOrigins;

const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    // React Native / mobile clients have no Origin header — always allow.
    if (!requestOrigin) return callback(null, true);

    const allowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string"
        ? allowed === requestOrigin
        : allowed.test(requestOrigin),
    );

    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin "${requestOrigin}" is not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Request-Id",
    "X-Api-Version",
  ],
  exposedHeaders: ["X-Request-Id", "Retry-After"],
  credentials: false,        // No cookies — mobile JWT flow only
  maxAge: 86_400,            // 24 h preflight cache
  optionsSuccessStatus: 204,
};

// ─── Helmet configuration ─────────────────────────────────────────────────
// CSP is tuned for an API server: only allow same-origin requests, no
// inline scripts or styles, no object embeds.  Browsers that somehow
// receive a JSON response and try to execute it cannot do anything.
const helmetOptions: Parameters<typeof helmet>[0] = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'"],
      imgSrc:      ["'self'"],
      objectSrc:   ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProd() ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy:   { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl:  { allow: false },
  frameguard:          { action: "deny" },
  hidePoweredBy:       true,      // Remove X-Powered-By: Express
  hsts: isProd()
    ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
    : false,
  ieNoOpen:            true,
  noSniff:             true,
  originAgentCluster:  true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy:      { policy: "strict-origin-when-cross-origin" },
  xssFilter:           true,
};

function isProd(): boolean {
  return env.NODE_ENV === "production";
}

// ─── Mount all three layers on the Express app ────────────────────────────
export function applySecurityMiddleware(app: Express): void {
  // 1. Security headers (must be first — before anything writes to the response)
  app.use(helmet(helmetOptions));

  // 2. CORS
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions)); // Explicit OPTIONS pre-flight handler

  // 3. Body parsers with size limits (prevents DoS via large payloads).
  //    express.json() and express.urlencoded() have no default size limit.
  app.use(express.json({ limit: env.BODY_SIZE_LIMIT }));
  app.use(
    express.urlencoded({ extended: false, limit: env.BODY_SIZE_LIMIT }),
  );
}
