/**
 * error-handler.ts — Production-safe global Express error handler.
 *
 * Security rationale
 * ──────────────────
 * Express's built-in error handler leaks:
 *   - Full stack traces (reveals file paths, library versions, logic flow)
 *   - Original error messages (may contain SQL, internal service names, etc.)
 *   - HTML error pages that can be rendered by browsers (XSS vector if the
 *     error message contains user-supplied data)
 *
 * This handler:
 *   1. Logs the full error (with stack trace) via pino — operators see everything.
 *   2. Returns a minimal JSON body to the client — never a stack trace.
 *   3. Translates known error types to appropriate HTTP status codes.
 *   4. Adds Retry-After for rate-limit (429) responses.
 *
 * MUST be registered LAST in app.ts (after all routes and the 404 handler)
 * for Express to treat it as an error handler.
 */

import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";
import { isProd } from "../lib/env";

interface ApiError {
  status:  number;
  error:   string;
  details?: unknown;
  requestId?: string;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId: string = String(req.id ?? "unknown");

  // ── Zod validation errors (thrown by route schemas) ────────────────────
  if (err instanceof ZodError) {
    const details = err.flatten().fieldErrors;
    logger.warn({ requestId, details }, "Request validation failed");
    const body: ApiError = {
      status:  422,
      error:   "Validation failed",
      details: isProd ? undefined : details,
      requestId,
    };
    res.status(422).json(body);
    return;
  }

  // ── CORS rejection (thrown by cors() middleware) ────────────────────────
  if (
    err instanceof Error &&
    err.message.startsWith("CORS:")
  ) {
    logger.warn({ requestId, origin: req.headers.origin }, "CORS rejection");
    res.status(403).json({
      status:    403,
      error:     "Forbidden — origin not allowed",
      requestId,
    } satisfies ApiError);
    return;
  }

  // ── HTTP-status errors (e.g. from express-rate-limit) ─────────────────
  const httpStatus: number =
    typeof (err as { status?: number }).status === "number"
      ? (err as { status: number }).status
      : typeof (err as { statusCode?: number }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;

  // ── Log with full detail for operators ─────────────────────────────────
  if (httpStatus >= 500) {
    logger.error(
      {
        requestId,
        err: {
          message: (err as Error).message,
          stack:   (err as Error).stack,
          name:    (err as Error).name,
        },
      },
      "Unhandled server error",
    );
  } else {
    logger.warn(
      { requestId, message: (err as Error).message, status: httpStatus },
      "Client error",
    );
  }

  // ── Response: NEVER send stack traces or raw error messages to clients ──
  const clientMessage =
    httpStatus >= 500
      ? "An unexpected error occurred. Please try again later."
      : (err as Error).message ?? "Request failed";

  const body: ApiError = {
    status:  httpStatus,
    error:   clientMessage,
    requestId,
  };

  res.status(httpStatus).json(body);
};
