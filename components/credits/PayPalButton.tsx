"use client";

/**
 * PayPalButton
 * =============
 * Renders a single PayPal checkout button for a credit pack.
 *
 * Key design decisions:
 *  - Module-level SDK singleton: loadScript() is called exactly ONCE regardless
 *    of how many instances mount simultaneously. Calling it multiple times in
 *    parallel causes PayPal's zoid renderer to destroy in-progress instances.
 *  - disableFunding: restricts to PayPal button only — hides card, bank
 *    transfers, Venmo, etc. that clutter the sandbox UI.
 *  - fundingSource: "paypal" enforces a single clean button per card.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadScript, type PayPalNamespace } from "@paypal/paypal-js";
import { createOrderAction, captureOrderAction } from "@/app/actions/credits";

// ---------------------------------------------------------------------------
// Module-level singleton — one SDK load shared across all instances
// ---------------------------------------------------------------------------

let _sdkPromise: Promise<PayPalNamespace | null> | null = null;

function getPayPalSDK(): Promise<PayPalNamespace | null> {
  if (!_sdkPromise) {
    _sdkPromise = loadScript({
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: "USD",
      intent: "capture",
      components: "buttons",
      disableFunding:
        "card,venmo,paylater,mybank,sepa,blik,eps,giropay,ideal,mercadopago,sofort",
    });
  }
  return _sdkPromise;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PackKey = "starter" | "growth" | "pro";

interface Props {
  packKey: PackKey;
}

export function PayPalButton({ packKey }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        const paypal = await getPayPalSDK();
        if (cancelled || !paypal?.Buttons || !containerRef.current) return;

        // Clear any prior render (React StrictMode mounts twice in dev)
        containerRef.current.innerHTML = "";

        const buttons = paypal.Buttons({
          // Restrict to the PayPal button only — no card / bank / wallet rows
          fundingSource: "paypal",
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay",
            height: 44,
          },

          createOrder: async () => {
            const result = await createOrderAction({ packKey });
            if (result?.data?.orderId) return result.data.orderId;
            throw new Error(result?.serverError ?? "Failed to create order");
          },

          onApprove: async (data) => {
            const result = await captureOrderAction({
              orderId: data.orderID,
              packKey,
            });
            if (result?.serverError) {
              if (!cancelled) setError(result.serverError);
              return;
            }
            if (!cancelled) {
              const creditsAdded = result?.data?.creditsAdded;
              setSuccess(true);
              setTimeout(
                () => router.push(`/credits?success=${creditsAdded ?? "ok"}`),
                1800,
              );
            }
          },

          onError: (err) => {
            console.error("[PayPalButton] SDK error:", err);
            if (!cancelled) setError("Payment failed. Please try again.");
          },

          onCancel: () => {
            // User dismissed the popup — no action needed
          },
        });

        if (!buttons.isEligible()) {
          if (!cancelled) setError("PayPal is not available right now.");
          return;
        }

        await buttons.render(containerRef.current);
        if (!cancelled) setRendered(true);
      } catch (err) {
        console.error("[PayPalButton] init error:", err);
        if (!cancelled)
          setError("Could not load payment system. Please refresh.");
      }
    }

    mount();
    return () => {
      cancelled = true;
    };
  }, [packKey]);

  if (success) {
    return (
      <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        ✓ Payment confirmed — updating balance…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Skeleton while SDK loads */}
      {!rendered && (
        <div className="h-[44px] animate-pulse rounded-md bg-muted" />
      )}
      <div ref={containerRef} />
    </div>
  );
}
