import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { RISK_COLORS, RISK_LABELS } from "@/lib/analysis-schema";
import type { RiskLevel } from "@/lib/analysis-schema";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { LegislationBadge } from "@/components/ui/LegislationBadge";
import { ComplianceTimeline } from "@/components/marketing/ComplianceTimeline";

export const metadata: Metadata = {
  title: "Regumatrix — Article-Grounded EU AI Act Compliance Checker",
  description:
    "Instantly determine your EU AI Act risk classification, applicable obligations, and key actions. Grounded in the full 113-article corpus of Regulation (EU) 2024/1689. 3 free analyses on sign-up — no credit card required.",
};

// Article reference for each risk level — only data that doesn't live in the schema
const RISK_PILL_ARTICLES: Record<RiskLevel, string> = {
  prohibited: "Art. 5",
  high_risk: "Art. 6 / Annex III",
  limited: "Art. 50",
  gpai: "Art. 51\u201355",
  minimal: "Voluntary",
};

export default function LandingPage() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-border/40 pb-20 pt-24">
        {/* Subtle gradient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.9_0.03_250),transparent)]
                     dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.25_0.05_250),transparent)]"
        />

        <div className="container mx-auto max-w-7xl px-4 text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex max-w-[90vw] items-start gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium leading-snug text-muted-foreground">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              Regulation (EU) 2024/1689 — full 113-article corpus
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Is your AI system compliant{" "}
            <span className="text-muted-foreground">with the EU AI Act?</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Describe what your system does. Get risk classification, your exact
            article obligations, and required actions — every finding cited to
            the actual regulation. In under a minute.
          </p>

          {/* Quick trust stats */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {[
              "Full 113-article corpus",
              "8-section structured report",
              "Results in ~30 seconds",
              "3 free analyses — no card needed",
            ].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <LegislationBadge variant="pill" />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start free — 3 analyses included
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                View pricing
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/analyze"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Run an analysis →
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-8 text-sm font-medium transition-colors hover:bg-accent"
              >
                Go to dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Describe your AI system",
                body: "Enter a plain-language description of what your system does, who it's for, and how decisions are made.",
              },
              {
                step: "02",
                title: "AI reads the regulation",
                body: "The engine pre-filters candidate articles from the full corpus, builds an article-grounded context, and runs the 6-step legal reasoning workflow.",
              },
              {
                step: "03",
                title: "Get your compliance picture",
                body: "Receive 8 structured sections — risk classification, operator role, obligations, key actions, timeline, penalty exposure, and a plain-language summary — every finding cited to the regulation.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 text-3xl font-bold text-muted-foreground/30">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Product demo — static preview of a real analysis output             */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-muted/20 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            See it in action
          </h2>
          <p className="mb-1 text-center text-sm text-muted-foreground">
            Real output from a 12-word description.
          </p>
          <p className="mb-12 text-center text-xs text-muted-foreground">
            More specific input → more precise obligations, more targeted
            actions.
          </p>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-md">
            {/* Sample banner */}
            <div className="border-b border-border bg-muted/50 px-5 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                ✦ Sample output — 12-word description
              </span>
            </div>

            {/* Description trigger */}
            <div className="flex items-start gap-3 border-b border-border bg-muted/30 px-5 py-3">
              <div className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Input
              </div>
              <p className="text-sm italic text-muted-foreground">
                &ldquo;An AI tool that screens and ranks job applicant CVs for
                employers in the EU.&rdquo;
              </p>
            </div>

            <div className="space-y-4 p-5">
              {/* Summary badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2.5 rounded-lg border border-border border-l-4 border-l-orange-500 bg-card px-4 py-2.5 shadow-sm">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Risk Classification
                    </p>
                    <p className="text-sm font-bold text-orange-800 dark:text-orange-400">
                      High-Risk — Annex III, §4(a)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Operator Role
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Provider — Art. 3(3)
                    </p>
                  </div>
                </div>
              </div>

              {/* Articles cited */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
                <span className="mr-1 text-xs font-medium text-muted-foreground">
                  Articles cited:
                </span>
                {[
                  "6",
                  "9",
                  "10",
                  "11",
                  "13",
                  "14",
                  "15",
                  "43",
                  "49",
                  "Annex III",
                  "Annex IV",
                ].map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>

              {/* Section 1 */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="px-5 py-3.5">
                  <span className="text-sm font-semibold">
                    1. Scope Assessment
                  </span>
                </div>
                <div className="border-t border-border px-5 pb-4 pt-3 text-sm text-muted-foreground">
                  <p>
                    This system falls within the material scope of the EU AI Act
                    (Art. 2(1)(a)) as an AI system placed on the EU market. The
                    automated ranking and filtering of job applicants
                    constitutes a consequential decision affecting natural
                    persons&apos; employment prospects…
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="px-5 py-3.5">
                  <span className="text-sm font-semibold">
                    5. Key Actions Required
                  </span>
                </div>
                <div className="border-t border-border px-5 pb-4 pt-3">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-400">
                      Immediate
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Already in force — act now
                    </span>
                  </div>
                  <ol className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        1
                      </span>
                      Register in the EU high-risk AI database before market
                      placement (Art. 49).
                    </li>
                    <li className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        2
                      </span>
                      Prepare technical documentation per Annex IV before
                      commercial deployment (Art. 11).
                    </li>
                  </ol>
                </div>
              </div>

              {/* Section 7 — fades out to imply more */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="px-5 py-3.5">
                  <span className="text-sm font-semibold">
                    7. Penalty Exposure
                  </span>
                </div>
                <div className="relative border-t border-border px-5 pt-3">
                  <p className="text-sm text-muted-foreground">
                    Non-compliance with high-risk AI obligations can attract
                    penalties of up to €30 000 000 or 6% of total worldwide
                    annual turnover (Art. 99(3))…
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent" />
                </div>
                <div className="h-6" />
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 dark:border-orange-500/20 dark:bg-orange-900/10">
                <p className="text-xs font-semibold text-orange-900 dark:text-orange-300">
                  12 words in. 8 structured sections out.
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-orange-800/80 dark:text-orange-400/80">
                  Scope · Risk classification · Operator role · Obligations ·
                  Key actions · Timeline · Penalty exposure · Plain language
                  summary. Your deployment context, sector, and oversight level
                  yield significantly more precise citations and action
                  timelines.
                </p>
              </div>

              {/* PDF download */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    See the full report
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Download a complete example PDF — the same format every
                    analysis generates.
                  </p>
                </div>
                <a
                  href="/EU_AI_Act_Compliance_Report_example.pdf"
                  download
                  className="ml-4 shrink-0 inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Download PDF →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Risk levels overview                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-border/40 bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Five risk levels — one analysis
          </h2>
          <p className="mb-12 text-center text-sm text-muted-foreground">
            The tool works top-down through the full EU AI Act risk cascade so
            you get the right answer, not just the safe answer.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {(Object.keys(RISK_PILL_ARTICLES) as RiskLevel[]).map((level) => (
              <div
                key={level}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium",
                  RISK_COLORS[level].pillBg,
                  RISK_COLORS[level].pillBorder,
                )}
              >
                <span className={RISK_COLORS[level].text}>
                  {RISK_LABELS[level]}
                </span>{" "}
                <span className={cn(RISK_COLORS[level].text, "opacity-60")}>
                  — {RISK_PILL_ARTICLES[level]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Compliance Deadline Timeline — fully date-driven, no manual updates  */}
      {/* ------------------------------------------------------------------ */}
      <ComplianceTimeline />

      <TestimonialsSection />

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Common questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Is this legal advice?",
                a: "No. This tool provides informational compliance analysis grounded in the text of the EU AI Act. It is not a substitute for qualified legal counsel. Treat the output as a structured starting point for your compliance review, not a final legal opinion.",
              },
              {
                q: "How current is the regulation it uses?",
                a: "The tool is grounded in the full text of Regulation (EU) 2024/1689 — the EU AI Act — as published in the Official Journal. The regulation entered into force on 1 August 2024, with obligations applying in phases from February 2025 onwards.",
              },
              {
                q: "What should I include in my description?",
                a: "For the most accurate analysis: what your system predicts or decides, who it affects (e.g. job applicants, patients, students), whether decisions are fully automated or subject to human review, where it is deployed (EU market / affecting EU persons), and your role — whether you are building the system yourself or deploying a third-party one.",
              },
              {
                q: "How long does an analysis take?",
                a: "Typically 20–40 seconds. The engine retrieves all relevant articles from the corpus, builds an article-grounded context, and runs a structured 8-section reasoning workflow. The loading screen shows each step in real time.",
              },
              {
                q: "Am I charged if an analysis fails?",
                a: "No. Credits are only deducted when an analysis completes successfully and is saved to your history. If there is a network error, timeout, or API failure, no credit is spent.",
              },
              {
                q: "Do credits expire?",
                a: "Credits never expire. Buy a pack once and use it at your own pace.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card px-5 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="ml-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to check your compliance?
          </h2>
          <p className="mt-4 text-muted-foreground">
            3 free analyses on sign-up. No credit card required.
          </p>
          <div className="mt-8">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Create free account →
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/analyze"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Run an analysis →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>
    </>
  );
}
