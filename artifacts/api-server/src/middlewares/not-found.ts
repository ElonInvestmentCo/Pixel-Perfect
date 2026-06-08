/**
 * not-found.ts — 404 handler for unmatched routes.
 *
 * Security rationale
 * ──────────────────
 * Express's built-in 404 response is an HTML page that includes the
 * requested path verbatim: "Cannot GET /some/path<script>...".  This is
 * a reflected XSS vector if the path contains user-supplied data and the
 * response is rendered in a browser.
 *
 * This handler always returns a minimal JSON body, stripping the path from
 * the response entirely so it cannot be used as a reflection point.
 *
 * It also emits a structured log entry so operators can detect enumeration
 * attacks (many 404s from a single IP in a short window).
 *
 * MUST be registered AFTER all routes and BEFORE the error handler.
 */

import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  logger.info(
    {
      requestId: req.id,
      method:    req.method,
      // Redact query strings — may contain tokens or PII.
      path:      req.path,
    },
    "Route not found",
  );

  res.status(404).json({
    status:    404,
    error:     "The requested resource was not found.",
    requestId: req.id,
  });
}
