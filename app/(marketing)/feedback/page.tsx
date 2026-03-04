"use client";

import { useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import { submitFeedback, type FeedbackState } from "@/app/actions/feedback";
import { Send, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 3000;

const INITIAL_STATE: FeedbackState = { status: "idle" };

export default function FeedbackPage() {
  const [state, formAction, isPending] = useActionState(
    submitFeedback,
    INITIAL_STATE,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = textareaRef.current?.value.length ?? 0;

  // Scroll to top on success
  useEffect(() => {
    if (state.status === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div className="py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Thanks — got it.
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Your feedback has been received. Every message gets read. If you
                left an email, expect a reply.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                ← Back to home
              </Link>
              <Link
                href="/analyze"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Run an analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Feedback
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tell me what you think.
          </h1>
          <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground">
            This tool is a work in progress. Your opinion matters — whether you
            think it&apos;s brilliant, broken, or somewhere in between.
            Don&apos;t leave anything out. If it&apos;s wrong, I want to know.
            If it helped, that&apos;s worth knowing too.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Suggestions, bug reports, feature requests, complaints — all
            welcome. Every message gets read personally.
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-5">
          {/* Message */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="message"
                className="text-sm font-medium text-foreground"
              >
                Your message
              </label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  charCount > MAX_CHARS * 0.9
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              ref={textareaRef}
              required
              minLength={10}
              maxLength={MAX_CHARS}
              rows={9}
              disabled={isPending}
              onInput={(e) => {
                // Trigger re-render for char count
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              placeholder="What works, what doesn't, what's missing, what you wish it did... Don't hold back."
              className={cn(
                "w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed outline-none ring-0 transition-colors",
                "placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-1 focus:ring-primary",
                "disabled:cursor-not-allowed disabled:opacity-50",
                state.status === "error"
                  ? "border-destructive focus:ring-destructive"
                  : "border-border",
              )}
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Email{" "}
              <span className="font-normal text-muted-foreground">
                (optional — only if you want a reply)
              </span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              disabled={isPending}
              placeholder="you@example.com"
              className={cn(
                "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-0 transition-colors",
                "placeholder:text-muted-foreground/50",
                "focus:border-primary focus:ring-1 focus:ring-primary",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>

          {/* Error */}
          {state.status === "error" && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.message}
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-xs text-muted-foreground">
              Feedback is stored securely and read by the founder.{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy policy
              </Link>
            </p>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all",
                "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {isPending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
