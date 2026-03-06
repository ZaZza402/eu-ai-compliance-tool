"use client";

import { useState, useId, useEffect } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

const LS_KEY = "regumatrix_newsletter_subscribed";

export function UpdateAlertsForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // null = unknown until hydrated; true = already subscribed
  const [alreadySubscribed, setAlreadySubscribed] = useState<boolean | null>(null);
  const checkboxId = useId();

  useEffect(() => {
    setAlreadySubscribed(localStorage.getItem(LS_KEY) === "1");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent || state === "loading") return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      });

      const data: { ok?: boolean; error?: string } = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
      } else {
        localStorage.setItem(LS_KEY, "1");
        setState("success");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  // Hidden until JS hydrates — avoids a flash of the form for returning subscribers
  if (alreadySubscribed === null) return null;

  // Returning subscriber — hide the whole box
  if (alreadySubscribed || state === "success") return null;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-foreground">
        Get update alerts
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        We&apos;ll email you when a regulation update is incorporated into our
        corpus. No marketing, no frequency targets — only meaningful changes.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-label="Email address for update alerts"
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={!email || !consent || state === "loading"}
            className="h-9 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "loading" ? "…" : "Notify me"}
          </button>
        </div>

        <label
          htmlFor={checkboxId}
          className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 shrink-0 accent-primary"
          />
          <span>
            I agree to receive update alerts from Regumatrix. You can
            unsubscribe at any time via the link in any email. See our{" "}
            <a
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              privacy policy
            </a>
            .
          </span>
        </label>

        {state === "error" && (
          <p role="alert" className="text-xs text-destructive">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
