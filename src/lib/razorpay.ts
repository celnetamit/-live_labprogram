import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export function razorpayConfigured(): boolean {
  return Boolean(KEY_ID && KEY_SECRET);
}

export function razorpayKeyId(): string {
  return KEY_ID;
}

/** Create a Razorpay order via REST (no SDK dependency). */
export async function createRazorpayOrder(params: {
  amountMinor: number;
  currency: string;
  receipt: string;
}): Promise<{ id: string }> {
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountMinor,
      currency: params.currency,
      receipt: params.receipt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${text}`);
  }
  return res.json();
}

/** Verify the checkout signature returned by Razorpay's client handler. */
export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
  } catch {
    return false;
  }
}
