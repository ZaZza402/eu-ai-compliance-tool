"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/deleteAccount";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DeleteAccountButton
 * ====================
 * Two-step confirmation: first click opens a modal, second click executes deletion.
 * Rendered on the Settings page in a "Danger Zone" section.
 */
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const CONFIRM_WORD = "DELETE";
  const isConfirmed = confirmed.trim().toUpperCase() === CONFIRM_WORD;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result && "error" in result) {
        setError(result.error);
      }
      // On success, server redirects to "/" — no client action needed
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        Delete my account
      </button>

      {/* Confirmation modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm account deletion"
        >
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Top danger stripe */}
            <div className="h-[3px] w-full bg-destructive" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Delete account permanently
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              {!isPending && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 pb-2 pt-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Deleting your account will permanently remove:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {[
                  "Your profile and authentication credentials",
                  "All compliance analyses and history",
                  "Your remaining credit balance",
                  "All transaction and billing records",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <label
                  htmlFor="confirm-delete"
                  className="mb-1.5 block text-xs font-medium text-foreground"
                >
                  Type{" "}
                  <span className="font-mono font-bold text-destructive">
                    {CONFIRM_WORD}
                  </span>{" "}
                  to confirm
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  value={confirmed}
                  onChange={(e) => setConfirmed(e.target.value)}
                  disabled={isPending}
                  autoComplete="off"
                  placeholder={CONFIRM_WORD}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none ring-0 transition-colors focus:border-destructive focus:ring-1 focus:ring-destructive disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || isPending}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors",
                  isConfirmed && !isPending
                    ? "bg-destructive hover:bg-destructive/90"
                    : "cursor-not-allowed bg-destructive/40",
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
