"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { markOrderPaid } from "./actions";

export default function MarkPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markOrderPaid(orderId);
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-brand rounded-lg text-xs font-medium disabled:opacity-60"
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      Mark Paid &amp; Grant
    </button>
  );
}
