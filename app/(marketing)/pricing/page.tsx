import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing — EU AI Act Compliance Checker",
  description:
    "Simple credit-based pricing. Buy once, credits never expire. 3 free analyses on every new account — no credit card required.",
};

const PACKS = [
  {
    name: "Starter",
    price: "$9",
    credits: 10,
    perAnalysis: "$0.90",
    features: [
      "10 compliance analyses",
      "Full 7-section structured report",
      "Risk classification & article grounding",
      "Key actions with compliance deadlines",
      "PDF export of every report",
    ],
    cta: "Buy Starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$29",
    credits: 40,
    perAnalysis: "$0.73",
    features: [
      "40 compliance analyses",
      "Everything in Starter",
      "Best value for regular use",
      "Ideal for teams reviewing multiple products",
    ],
    cta: "Buy Growth",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$79",
    credits: 120,
    perAnalysis: "$0.66",
    features: [
      "120 compliance analyses",
      "Everything in Growth",
      "Lowest per-analysis cost",
      "API access (coming soon)",
    ],
    cta: "Buy Pro",
    highlight: false,
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
            Buy a credit pack once. Credits never expire. Each compliance
            analysis costs 1 credit.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            A professional pre-screening engagement — just the discovery call
            where an expert figures out what your tool does — starts at around
            €500. For the cost of that call you can run over 500 analyses here.
            These prices exist to keep this tool online and available, nothing
            more.
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

              <div className="mb-6">
                <h2 className="text-lg font-semibold">{pack.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{pack.price}</span>
                  <span className="text-sm text-muted-foreground">
                    one-time
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pack.credits} analyses · {pack.perAnalysis} each
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

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
            <a
              href="mailto:support@caustic.app"
              className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              support@caustic.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
