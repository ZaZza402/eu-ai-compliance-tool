"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  credits: string | number;
}

export function SuccessBanner({ credits }: Props) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const label =
    typeof credits === "number" || /^\d+$/.test(String(credits))
      ? `${credits} credits added to your balance`
      : "Credits added to your balance";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-50 px-5 py-3 text-sm dark:bg-emerald-900/20">
      <span className="font-medium text-emerald-700 dark:text-emerald-300">
        ✓ Payment confirmed — {label}.
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="shrink-0 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
