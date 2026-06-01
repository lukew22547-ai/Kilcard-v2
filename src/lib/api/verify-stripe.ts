import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyStripeSession = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return { valid: false, reason: "not_configured" };

    try {
      const res = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${data.sessionId}`,
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
      const session = await res.json() as { payment_status?: string; error?: { message: string } };
      if (session.error) return { valid: false, reason: "stripe_error" };
      return { valid: session.payment_status === "paid" };
    } catch {
      return { valid: false, reason: "fetch_error" };
    }
  });
