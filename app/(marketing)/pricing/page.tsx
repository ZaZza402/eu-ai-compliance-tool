import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing — Regumatrix",
  description:
    "Simple credit-based pricing. Buy once, credits never expire. 3 free analyses on every new account — no credit card required.",
};

const INCLUDED_IN_ALL = [
  "Full 8-section structured compliance report",
  "Risk classification with regulation grounding",
  "Applicable obligations per article",
  "Key actions with compliance deadlines",
  "Penalty exposure analysis",
  "PDF export of every report",
  "Permanent analysis history",
];

const PACKS = [
  {
    name: "Pilot",
    price: "$9",
    credits: 10,
    perAnalysis: "$0.90",
    savings: null,
    scope: "Try it on 3–5 AI systems",
    highlight: false,
    cta: "Get Pilot",
  },
  {
    name: "Mission",
    price: "$29",
    credits: 40,
    perAnalysis: "$0.73",
    savings: "Save 19%",
    scope: "Suitable for 10–15 AI systems",
    highlight: true,
    cta: "Get Mission",
  },
  {
    name: "Command",
    price: "$79",
    credits: 120,
    perAnalysis: "$0.66",
    savings: "Save 27%",
    scope: "Organisation-wide reviews",
    highlight: false,
    cta: "Get Command",
  },
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />3 free
            analyses included on every new account
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Priced to stay online,
            <br />
            <span className="text-muted-foreground">not to get rich.</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            Buy credits once. They never expire. Every pack unlocks the full
            tool — more credits just means more analyses for less per run.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            A professional pre-screening engagement — just the discovery call
            where an expert figures out what your tool does — starts at around
            €500. For the cost of that call you can run over 500 analyses here.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {PACKS.map((pack) => (
            <div
              key={pack.name}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                pack.highlight
                  ? "border-primary bg-card ring-1 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              {pack.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most popular
                </div>
              )}

              {/* Price block */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold">{pack.name}</h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{pack.price}</span>
                  <span className="text-sm text-muted-foreground">
                    one-time
                  </span>
                  {pack.savings && (
                    <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {pack.savings}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {pack.credits} analyses
                </p>
                <p className="text-xs text-muted-foreground">
                  {pack.perAnalysis} per analysis · {pack.scope}
                </p>
              </div>

              {/* What's included — same for all packs */}
              <div className="mb-8 flex-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Everything included
                </p>
                <ul className="space-y-2.5">
                  {INCLUDED_IN_ALL.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <SignedOut>
                <Link
                  href="/sign-up"
                  className={`inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pack.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {pack.cta}
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/credits"
                  className={`inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pack.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {pack.cta}
                </Link>
              </SignedIn>
            </div>
          ))}
        </div>

        {/* Value anchor row */}
        <div className="mt-8 rounded-xl border border-border bg-muted/40 px-6 py-4">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              All packs, same full tool.
            </span>{" "}
            No locked features, no tiers, no subscriptions. The only difference
            is how many analyses you get and the price per run.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-20 space-y-3 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            All payments processed securely by{" "}
            <span className="font-medium text-foreground">PayPal</span>. Credits
            are added instantly after payment.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions, concerns, or want to know more about why this tool was
            built?{" "}
            <a
              href="/about"
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              Read the founder note
            </a>{" "}
            or{" "}
            <a
              href="/feedback"
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              leave feedback
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground">
            Need to get in touch?{" "}
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              Contact us →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
