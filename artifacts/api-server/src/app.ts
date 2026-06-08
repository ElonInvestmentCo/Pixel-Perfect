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
 *  8. Routes        — Business logic.
 *  9. notFound      — 404 for unmatched paths (clean JSON, no path reflection).
 * 10. errorHandler  — Global error handler (no stack-trace leakage in prod).
 */

import pinoHttp from "pino-http";
import express, { type Express } from "express";
import { randomUUID } from "crypto";

import { logger }                 from "./lib/logger";
import { applySecurityMiddleware } from "./middlewares/security";
import { globalLimiter, skipHealthCheck } from "./middlewares/rate-limit";
import { sanitizeRequest }        from "./middlewares/sanitize";
import { requestId }              from "./middlewares/request-id";
import { notFound }               from "./middlewares/not-found";
import { errorHandler }           from "./middlewares/error-handler";
import router                     from "./routes";

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

// ── 7. API routes ────────────────────────────────────────────────────────────
app.use("/api", router);

// ── 8. 404 handler ───────────────────────────────────────────────────────────
app.use(notFound);

// ── 9. Global error handler ──────────────────────────────────────────────────
// Must be the LAST app.use() call — Express identifies error handlers by
// their 4-argument signature (err, req, res, next).
app.use(errorHandler);

export default app;
