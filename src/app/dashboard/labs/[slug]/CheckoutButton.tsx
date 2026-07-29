"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutButton({
  labId,
  priceLabel,
  compact = false,
}: {
  labId: string;
  priceLabel: string;
  /** Keep the button its intrinsic width and centre it, for standalone panels. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function finalizeMock(orderId: string) {
    const res = await fetch(`/api/orders/${orderId}/mock-pay`, { method: "POST" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Payment failed");
  }

  async function handleBuy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId }),
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Invalid response from server");
      }
      if (!res.ok) throw new Error(data.message || "Checkout failed");

      if (data.mode === "mock") {
        await finalizeMock(data.orderId);
        router.refresh();
        return;
      }

      // Razorpay live mode
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) throw new Error("Could not load payment gateway");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountMinor,
        currency: data.currency,
        name: "Panoptical Labs",
        description: data.labTitle,
        order_id: data.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch(`/api/orders/${data.orderId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verify.ok) {
            router.refresh();
          } else {
            setError("Payment verification failed. Contact support if you were charged.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#5159ee" },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    /*
      Stretches to its container by default so it can sit in the sticky rail and
      the mobile action bar without a bespoke wrapper; the standalone paywall
      panel passes `compact` to keep the button its own width and centred.
    */
    <div className={`flex flex-col gap-2 ${compact ? "items-center" : "items-stretch"}`}>
      <button
        onClick={handleBuy}
        disabled={loading}
        className={`btn-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 ${
          compact ? "px-8" : "w-full px-6"
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ShoppingCart className="h-5 w-5" />
        )}
        <span className="truncate">{loading ? "Processing…" : `Unlock · ${priceLabel}`}</span>
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
