"use client";

import { useEffect, useState } from "react";
import { UpdateAlertsForm } from "@/components/newsletter/UpdateAlertsForm";

const LS_KEY = "regumatrix_newsletter_subscribed";

/**
 * Wraps the footer "Stay informed" box.
 * Hides the entire section (including the grey card) once a user has
 * subscribed — no empty shell left behind.
 */
export function NewsletterFooterBox() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    setSubscribed(localStorage.getItem(LS_KEY) === "1");

    // Listen for the key being set in this same tab (set by UpdateAlertsForm)
    function onStorage(e: StorageEvent) {
      if (e.key === LS_KEY && e.newValue === "1") setSubscribed(true);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // null = pre-hydration, avoid flash
  if (subscribed === null || subscribed) return null;

  return (
    <div className="mb-8 rounded-xl border border-border bg-muted/20 px-6 py-5 sm:flex sm:items-start sm:gap-12">
      <div className="mb-4 shrink-0 sm:mb-0 sm:max-w-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Stay informed
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The EU AI Act is a living regulatory framework. Subscribe for a brief
          notification when our corpus is updated to reflect an amendment or
          corrigendum.
        </p>
      </div>
      <div className="flex-1">
        <UpdateAlertsForm />
      </div>
    </div>
  );
}
