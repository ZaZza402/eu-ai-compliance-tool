"use client";

/**
 * CookieConsent
 * =============
 * A high-end 2026-style cookie consent system with three layers:
 *
 *   1. <CookieBanner>   — First-visit bottom-centre banner (slide-up).
 *   2. <CookieSettings> — Full preference modal (strictly necessary, analytics).
 *   3. <CookieButton>   — Persistent floating pill, bottom-left, opens Settings.
 *
 * Consent is persisted in localStorage under the key "eu_cookie_consent".
 * All three are rendered only on marketing pages (see MarketingLayout).
 */

import { useState, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal, Cookie, Check, Shield } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CookiePreferences {
  necessary: true; // always true — no toggle
  analytics: boolean;
}

const LS_KEY = "eu_cookie_consent";
const BANNER_DELAY_MS = 1200; // slight delay so page settles first

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadPrefs(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function savePrefs(prefs: CookiePreferences) {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}

// ---------------------------------------------------------------------------
// Toggle row
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  description,
  checked,
  locked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {locked && (
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Required
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          locked
            ? "cursor-not-allowed border-primary/40 bg-primary/40"
            : checked
              ? "border-primary bg-primary"
              : "border-border bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          )}
          style={{ top: "1px", left: "1px" }}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings modal
// ---------------------------------------------------------------------------

function CookieSettings({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (prefs: CookiePreferences) => void;
  initial: CookiePreferences;
}) {
  const [analytics, setAnalytics] = useState(initial.analytics);

  // Sync when initial changes (e.g. re-opened after first accept)
  useEffect(() => {
    setAnalytics(initial.analytics);
  }, [initial.analytics]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Cookie preferences</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            We use cookies and similar technologies to operate the service and
            understand how it&apos;s used. Select which types you allow.{" "}
            <a
              href="/privacy#cookies"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Cookie policy
            </a>
          </p>

          <div className="mt-2 divide-y divide-border">
            <ToggleRow
              label="Strictly necessary"
              description="Authentication, session management, and remembering your cookie preferences. Cannot be disabled."
              checked={true}
              locked
            />
            <ToggleRow
              label="Analytics"
              description="Anonymised page-view and feature-usage data. Helps us understand how the product is used and improve it. No advertising network involvement."
              checked={analytics}
              onChange={setAnalytics}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => onSave({ necessary: true, analytics: false })}
            className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Reject all optional
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSave({ necessary: true, analytics })}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-xs font-medium transition-colors hover:bg-muted"
            >
              Save preferences
            </button>
            <button
              type="button"
              onClick={() => onSave({ necessary: true, analytics: true })}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onCustomise,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomise: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mount so the slide-up animation is visible
    const t = setTimeout(() => setMounted(true), BANNER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[150] px-4 pb-4 sm:bottom-6 sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2 sm:px-0",
        "transition-all duration-500 ease-out",
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-md">
        {/* Top stripe */}
        <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <div className="p-5">
          {/* Icon + heading */}
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                We use cookies
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Strictly necessary cookies are always active. We&apos;d also
                like to set analytics cookies to understand how the site is
                used.{" "}
                <a
                  href="/privacy#cookies"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCustomise}
              className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Customise
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              Reject optional
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="h-3 w-3" />
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating cookie button (always visible after consent given)
// ---------------------------------------------------------------------------

function CookieFloatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cookie preferences"
      className={cn(
        "fixed bottom-5 left-5 z-[140] flex items-center gap-2 rounded-full",
        "border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-md",
        "text-xs font-medium text-muted-foreground",
        "transition-all duration-200 hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <Shield className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Cookie preferences</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Root controller — rendered once in MarketingLayout
// ---------------------------------------------------------------------------

export function CookieConsentController() {
  const [prefs, setPrefs] = useState<CookiePreferences | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  if (!hydrated) return null; // avoid SSR mismatch

  const hasConsented = prefs !== null;

  function handleSave(p: CookiePreferences) {
    savePrefs(p);
    setPrefs(p);
    setSettingsOpen(false);
  }

  return (
    <>
      {/* Show banner only when no consent recorded yet */}
      {!hasConsented && (
        <CookieBanner
          onAcceptAll={() => handleSave({ necessary: true, analytics: true })}
          onRejectAll={() => handleSave({ necessary: true, analytics: false })}
          onCustomise={() => setSettingsOpen(true)}
        />
      )}

      {/* Floating button — always visible after consent (or during customise flow) */}
      {(hasConsented || settingsOpen) && (
        <CookieFloatButton onClick={() => setSettingsOpen(true)} />
      )}

      {/* Settings modal */}
      <CookieSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSave}
        initial={prefs ?? { necessary: true, analytics: false }}
      />
    </>
  );
}
