import { Router } from "express";

const router = Router();

const pushTokens = new Set<string>();

router.post("/api/notifications/register", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== "string") {
    return void res.status(400).json({ error: "token required" });
  }
  pushTokens.add(token);
  return void res.json({ success: true, registered: pushTokens.size });
});

router.post("/api/notifications/test", async (req, res) => {
  const { type = "transfer", to } = req.body as { type?: string; to?: string };

  const content =
    type === "transfer"
      ? {
          title: "Transfer Received 💸",
          body: "Alex Johnson sent you $500.00",
          data: { type: "transfer", amount: "$500.00", sender: "Alex Johnson" },
        }
      : type === "card"
      ? {
          title: "Card Activity 💳",
          body: "Card ••4242 used at Amazon • $29.99",
          data: { type: "card", amount: "$29.99", merchant: "Amazon" },
        }
      : {
          title: "PayVora",
          body: "Your account has been updated successfully.",
          data: { type: "info" },
        };

  const targets = to ? [to] : [...pushTokens];

  if (targets.length === 0) {
    return void res.json({ success: true, sent: 0, message: "No tokens registered" });
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(
        targets.map((t) => ({
          to: t,
          sound: "default",
          ...content,
        })),
      ),
    });
    const result = (await response.json()) as unknown;
    return void res.json({ success: true, sent: targets.length, result });
  } catch (err) {
    return void res.status(500).json({ error: "Failed to send", details: String(err) });
  }
});

export default router;
