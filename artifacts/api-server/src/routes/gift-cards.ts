/**
 * gift-cards.ts — Reloadly Gift Cards routes.
 *
 * Routes
 * ──────
 *   GET  /gift-cards/products          List products (?countryCode=US&page=1&size=20)
 *   GET  /gift-cards/products/:id      Single product detail
 *   POST /gift-cards/order             Purchase a gift card (auth required)
 *
 * Public routes: products listing + detail (no auth needed for browsing).
 * Purchase requires a valid Bearer JWT.
 */

import { randomBytes }              from "crypto";
import { Router }                    from "express";
import { z }                         from "zod";
import { env }                       from "../lib/env";
import { getGCProduct, getGCProducts, placeGCOrder } from "../lib/giftcards";
import { requireAuth, type AuthRequest } from "../middlewares/require-auth";

const router = Router();

function assertConfigured(res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  if (!env.RELOADLY_CLIENT_ID || !env.RELOADLY_CLIENT_SECRET) {
    res.status(503).json({ error: "Gift card service is not configured on this server." });
    return false;
  }
  return true;
}

// ── GET /gift-cards/products ──────────────────────────────────────────────────

router.get("/gift-cards/products", async (req, res, next) => {
  if (!assertConfigured(res)) return;
  try {
    const countryCode = typeof req.query.countryCode === "string" ? req.query.countryCode : "US";
    const page        = Number(req.query.page) || 1;
    const size        = Math.min(Number(req.query.size) || 20, 50);

    const result = await getGCProducts({ countryCode, page, size, includeRange: true });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── GET /gift-cards/products/:id ──────────────────────────────────────────────

router.get("/gift-cards/products/:id", async (req, res, next) => {
  if (!assertConfigured(res)) return;
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID." });
      return;
    }
    const product = await getGCProduct(productId);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// ── POST /gift-cards/order ────────────────────────────────────────────────────

const orderSchema = z.object({
  productId:      z.number().int().positive(),
  unitPrice:      z.number().positive(),
  recipientEmail: z.string().email(),
  senderName:     z.string().min(1).max(100).optional(),
});

router.post("/gift-cards/order", requireAuth, async (req: AuthRequest, res, next) => {
  if (!assertConfigured(res)) return;
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request.", details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { productId, unitPrice, recipientEmail, senderName } = parsed.data;
    const customIdentifier = `gc-${req.user!.userId}-${randomBytes(6).toString("hex")}`;

    const result = await placeGCOrder({
      productId,
      quantity:        1,
      unitPrice,
      customIdentifier,
      senderName:      senderName ?? "PayVora User",
      recipientEmail,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
