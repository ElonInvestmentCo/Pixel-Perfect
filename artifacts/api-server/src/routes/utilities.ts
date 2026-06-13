/**
 * utilities.ts — Reloadly Utility Payment routes.
 *
 * Routes
 * ──────
 *   GET  /utilities/billers        List billers (?countryCode=NG&type=ELECTRICITY_BILL_PAYMENT)
 *   POST /utilities/pay            Pay a utility bill (auth required)
 */

import { randomBytes }              from "crypto";
import { Router }                    from "express";
import { z }                         from "zod";
import { env }                       from "../lib/env";
import { getBillers, payUtilityBill } from "../lib/utilities";
import { requireAuth, type AuthRequest } from "../middlewares/require-auth";

const router = Router();

function assertConfigured(res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  if (!env.RELOADLY_CLIENT_ID || !env.RELOADLY_CLIENT_SECRET) {
    res.status(503).json({ error: "Utility payment service is not configured on this server." });
    return false;
  }
  return true;
}

// ── GET /utilities/billers ────────────────────────────────────────────────────

router.get("/utilities/billers", async (req, res, next) => {
  if (!assertConfigured(res)) return;
  try {
    const countryCode = typeof req.query.countryCode === "string" ? req.query.countryCode : "NG";
    const type        = typeof req.query.type === "string" ? req.query.type as import("../lib/utilities").BillerType : undefined;

    const billers = await getBillers({ countryCode, type, size: 50 });
    res.json(billers);
  } catch (err) {
    next(err);
  }
});

// ── POST /utilities/pay ───────────────────────────────────────────────────────

const paySchema = z.object({
  billerId:               z.number().int().positive(),
  amount:                 z.number().positive(),
  subscriberAccountNumber: z.string().min(1).max(100),
  useLocalAmount:         z.boolean().optional(),
});

router.post("/utilities/pay", requireAuth, async (req: AuthRequest, res, next) => {
  if (!assertConfigured(res)) return;
  try {
    const parsed = paySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { billerId, amount, subscriberAccountNumber, useLocalAmount } = parsed.data;
    const customIdentifier = `ut-${req.user!.userId}-${randomBytes(6).toString("hex")}`;

    const result = await payUtilityBill({
      billerId,
      amount,
      subscriberAccountNumber,
      customIdentifier,
      useLocalAmount: useLocalAmount ?? false,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
