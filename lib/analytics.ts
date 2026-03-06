/**
 * Thin wrapper around window.gtag for custom GA4 event tracking.
 * All calls are no-ops if GA4 is not loaded (e.g. no ID set, ad-blocker, SSR).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params ?? {});
}
