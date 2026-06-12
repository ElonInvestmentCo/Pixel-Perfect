/**
 * airtime.ts — Reloadly airtime & data top-up routes.
 *
 * Routes
 * ──────
 *   GET  /airtime/countries              List all Reloadly-supported countries
 *   GET  /airtime/operators              Operators for a country (?countryCode=NG)
 *   GET  /airtime/detect                 Auto-detect operator (?phone=+234...&countryCode=NG)
 *   GET  /airtime/bundles/:operatorId    Data bundles for an operator
 *   POST /airtime/topup                  Execute an airtime or data top-up (auth required)
 *
 * Authentication
 * ──────────────
 * Informational routes (countries, operators, detect, bundles) are public.
 * The top-up route requires a valid Bearer JWT — use requireAuth middleware.
 *
 * Error handling
 * ──────────────
 * All Reloadly API errors are forwarded to the global error handler via next().
 * If RELOADLY_CLIENT_ID / RELOADLY_CLIENT_SECRET are not configured the
 * routes return 503 immediately.
 */

import { randomBytes } from "crypto";
import { Router } from "express";
import { z } from "zod";

import { env } from "../lib/env";
import {
  detectOperator,
  executeTopup,
  getCountries,
  getDataBundles,
  getOperatorsByCountry,
} from "../lib/reloadly";
import { requireAuth, type AuthRequest } from "../middlewares/require-auth";
import { authLimiter } from "../middlewares/rate-limit";

const router = Router();

function assertReloadlyConfigured(
  res: Parameters<Parameters<typeof router.get>[1]>[1],
): boolean {
  if (!env.RELOADLY_CLIENT_ID || !env.RELOADLY_CLIENT_SECRET) {
    res.status(503).json({
      error: "Airtime service is not configured on this server.",
    });
    return false;
  }
  return true;
}

// ── GET /airtime/countries ────────────────────────────────────────────────────

router.get("/airtime/countries", async (req, res, next) => {
  if (!assertReloadlyConfigured(res)) return;
  try {
    const countries = await getCountries();
    res.json(countries);
  } catch (err) {
    next(err);
  }
});

// ── GET /airtime/operators?countryCode=NG ─────────────────────────────────────

router.get("/airtime/operators", async (req, res, next) => {
  if (!assertReloadlyConfigured(res)) return;

  const countryCode = (req.query.countryCode as string)?.toUpperCase();
  if (!countryCode || countryCode.length !== 2) {
    res.status(400).json({ error: "countryCode query param must be a 2-letter ISO code." });
    return;
  }

  try {
    const operators = await getOperatorsByCountry(countryCode);
    res.json(operators);
  } catch (err) {
    next(err);
  }
});

// ── GET /airtime/detect?phone=+2348...&countryCode=NG ─────────────────────────

router.get("/airtime/detect", async (req, res, next) => {
  if (!assertReloadlyConfigured(res)) return;

  const phone       = req.query.phone       as string | undefined;
  const countryCode = (req.query.countryCode as string | undefined)?.toUpperCase();

  if (!phone || !countryCode) {
    res.status(400).json({ error: "phone and countryCode query params are required." });
    return;
  }

  try {
    const operator = await detectOperator(phone, countryCode);
    res.json(operator);
  } catch (err: any) {
    // Reloadly returns 404 when it cannot auto-detect — surface it as 422 so
    // the client can show a "manual selection" fallback without a generic 500.
    if (err?.status === 404) {
      let friendlyMsg = "Could not detect operator for this number. Please select manually.";
      try {
        const body = typeof err.body === "string" ? JSON.parse(err.body) : err.body;
        if (body?.message) friendlyMsg = body.message;
      } catch { /* ignore */ }
      res.status(422).json({ error: friendlyMsg, code: "COULD_NOT_AUTO_DETECT" });
      return;
    }
    next(err);
  }
});

// ── GET /airtime/bundles/:operatorId ──────────────────────────────────────────

router.get("/airtime/bundles/:operatorId", async (req, res, next) => {
  if (!assertReloadlyConfigured(res)) return;

  const operatorId = parseInt(req.params.operatorId, 10);
  if (isNaN(operatorId)) {
    res.status(400).json({ error: "operatorId must be a number." });
    return;
  }

  try {
    const bundles = await getDataBundles(operatorId);
    res.json(bundles);
  } catch (err: any) {
    // Reloadly returns 404 when this operator has no bundles — return an empty
    // array so the client shows "no bundles" rather than an error screen.
    if (err?.status === 404) {
      res.json([]);
      return;
    }
    next(err);
  }
});

// ── POST /airtime/topup  (authentication required) ────────────────────────────

const topupSchema = z.object({
  operatorId:     z.number().int().positive(),
  amount:         z.number().positive(),
  phone:          z.string().min(4).max(20),
  countryCode:    z.string().length(2),
  useLocalAmount: z.boolean().default(false),
});

router.post(
  "/airtime/topup",
  authLimiter,
  requireAuth,
  async (req: AuthRequest, res, next) => {
    if (!assertReloadlyConfigured(res)) return;

    const parsed = topupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error:   "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { operatorId, amount, phone, countryCode, useLocalAmount } = parsed.data;

    const customIdentifier = `payvora-${req.userId ?? "anon"}-${randomBytes(6).toString("hex")}`;

    try {
      const result = await executeTopup({
        operatorId,
        amount,
        useLocalAmount,
        customIdentifier,
        recipientPhone: { countryCode: countryCode.toUpperCase(), number: phone },
        senderPhone:    { countryCode: "US", number: "12025550137" },
      });

      res.json({
        transactionId:    result.transactionId,
        status:           result.status,
        operatorName:     result.operatorName,
        recipientPhone:   result.recipientPhone,
        deliveredAmount:  result.deliveredAmount,
        deliveredCurrency: result.deliveredAmountCurrencyCode,
        requestedAmount:  result.requestedAmount,
        requestedCurrency: result.requestedAmountCurrencyCode,
        discount:         result.discount,
        transactionDate:  result.transactionDate,
        balance:          result.balanceInfo.newBalance,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
