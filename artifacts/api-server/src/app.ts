/**
 * app.ts — Express application with enterprise-grade security middleware stack.
 *
 * Middleware order matters — every layer is applied in this exact sequence:
 *
 *  1. requestId     — Assign CSPRNG UUID before ANY logging or processing.
 *  2. pinoHttp      — Structured request logging (uses req.id from step 1).
 *  3. Helmet        — HTTP security headers (must precede any response write).
 *  4. CORS          — Origin validation + OPTIONS pre-flight.
 *  5. globalLimiter — Drop rate-exceeded requests before body parsing.
 *  6. Body parsers  — JSON + URL-encoded with size limits (prevents DoS).
 *  7. sanitize      — Strip prototype-pollution keys from parsed body.
 *  7b. Public pages — Landing, Privacy, Terms served before SPA fallback.
 *  8. Routes        — Business logic.
 *  9. notFound      — 404 for unmatched paths (clean JSON, no path reflection).
 * 10. errorHandler  — Global error handler (no stack-trace leakage in prod).
 */

import pinoHttp from "pino-http";
import express, { type Express } from "express";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

import { logger }                 from "./lib/logger";
import { applySecurityMiddleware } from "./middlewares/security";
import { globalLimiter, skipHealthCheck } from "./middlewares/rate-limit";
import { sanitizeRequest }        from "./middlewares/sanitize";
import { requestId }              from "./middlewares/request-id";
import { notFound }               from "./middlewares/not-found";
import { errorHandler }           from "./middlewares/error-handler";
import router                     from "./routes";
import pagesRouter                from "./routes/pages";
import { isProd }                 from "./lib/env";

const app: Express = express();

// ── Trust exactly one reverse-proxy hop ──────────────────────────────────────
// Required for express-rate-limit to read the real client IP from
// X-Forwarded-For.  Only trust 1 hop — more allows IP spoofing.
app.set("trust proxy", 1);

// ── Disable X-Powered-By (belt-and-suspenders alongside Helmet) ─────────────
app.disable("x-powered-by");

// ── 1. Request ID ────────────────────────────────────────────────────────────
app.use(requestId);

// ── 2. Structured logging ────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    // Use the UUID we just assigned — consistent across log lines.
    genReqId: (req) => (req as express.Request).id ?? randomUUID(),
    serializers: {
      req(req) {
        return {
          id:     req.id,
          method: req.method,
          // Strip query strings from logs — may contain tokens / PII.
          url:    req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── 3 + 4. Helmet security headers + CORS + body parsers with size limits ────
applySecurityMiddleware(app);

// ── 5. Global rate limiter ───────────────────────────────────────────────────
// Health-check endpoint is exempted so load-balancer probes are never blocked.
app.use((req, res, next) => {
  if (skipHealthCheck(req)) return next();
  return globalLimiter(req, res, next);
});

// ── 6. Input sanitization ────────────────────────────────────────────────────
// Runs AFTER body parsers so req.body is populated, BEFORE routes.
app.use(sanitizeRequest);

// ── 7b. Public HTML pages — served before API routes and SPA fallback ────────
// Landing (/), Privacy Policy (/privacy), Terms of Service (/terms).
// Each handler overrides the Helmet CSP for HTML rendering.
app.use(pagesRouter);

// ── 8. API routes ────────────────────────────────────────────────────────────
app.use("/api", router);

// ── 8. Serve Expo web build in production ─────────────────────────────────────
// In dev the Expo Metro dev server + dev-proxy handle web serving.
// In production we export the Expo app to static files and serve them here.
if (isProd) {
  const webDist = path.resolve(process.cwd(), "artifacts/mobile/dist");
  if (fs.existsSync(webDist)) {
    logger.info({ webDist }, "Serving Expo web build as static files");
    app.use(express.static(webDist));
    // SPA fallback — any non-API path returns index.html so client-side routing works
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(webDist, "index.html"));
    });
  } else {
    logger.info({ webDist }, "Expo web dist not found — API-only mode, web serving skipped");
  }
}

// ── 9. 404 handler (dev only — prod serves SPA fallback above) ───────────────
app.use(notFound);

// ── 9. Global error handler ──────────────────────────────────────────────────
// Must be the LAST app.use() call — Express identifies error handlers by
// their 4-argument signature (err, req, res, next).
app.use(errorHandler);

export default app;
