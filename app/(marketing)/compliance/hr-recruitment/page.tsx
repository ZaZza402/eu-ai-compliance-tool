import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "EU AI Act Compliance for HR & Recruitment AI",
  description:
    "Hiring algorithms, CV screening tools, and AI-assisted HR decisions are high-risk under EU AI Act Annex III point 4. Understand your obligations as a provider or deployer.",
  openGraph: {
    title: "EU AI Act — HR & Recruitment AI Compliance | Regumatrix",
    description:
      "AI used in recruitment, performance evaluation, or employment decisions is high-risk. Find out your exact obligations before August 2026.",
  },
};

const obligations = [
  {
    art: "Art. 9",
    text: "Documented risk management covering bias, fairness and discrimination risks",
  },
  {
    art: "Art. 10",
    text: "Training data must not encode historical discrimination or proxy variables",
  },
  {
    art: "Art. 12",
    text: "Log all decisions and retain records for at least 6 months",
  },
  {
    art: "Art. 13",
    text: "Instructions for use must clearly state limitations and data requirements",
  },
  {
    art: "Art. 14",
    text: "Human oversight: hiring decisions must not be fully automated",
  },
  {
    art: "Art. 26",
    text: "Deployers (employers) must conduct a fundamental rights impact assessment",
  },
  {
    art: "Art. 50",
    text: "AI-generated content used in hiring must be marked as AI-generated",
  },
];

export default function HRRecruitmentPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">HR &amp; Recruitment AI</span>
        </nav>

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-950 dark:bg-orange-900/30 dark:text-orange-200">
            High Risk — Annex III, Point 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act: HR &amp; Recruitment AI Compliance
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI systems used in employment decisions — including CV screening,
            candidate ranking, performance evaluation, and promotion decisions —
            are explicitly listed as{" "}
            <strong>high-risk in Annex III, point 4</strong>. Compliance is
            mandatory from August 2026.
          </p>
        </div>

        <div className="mb-10 rounded-xl border border-orange-300 bg-orange-50 p-6 dark:border-orange-700/40 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <h2 className="font-semibold text-foreground">
                Covered systems under Annex III(4)
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                {[
                  "CV screening and applicant ranking tools",
                  "Automated video interview assessment (tone, facial expression analysis)",
                  "Psychometric AI testing platforms",
                  "Performance monitoring and scoring systems",
                  "AI tools for promotion, demotion, or termination decisions",
                  "Task allocation systems with material impact on working conditions",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold">
            Key obligations for HR AI providers and deployers
          </h2>
          <div className="space-y-3">
            {obligations.map((o) => (
              <div key={o.art} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <div>
                  <Link
                    href={`/articles/${o.art.replace("Art. ", "")}`}
                    className="text-xs font-mono font-semibold text-primary hover:underline"
                  >
                    {o.art}
                  </Link>
                  <span className="ml-2 text-sm text-foreground/90">
                    {o.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">GDPR interaction</h2>
          <p className="text-sm text-muted-foreground">
            Article 22 of GDPR already restricts fully automated decisions in
            employment. The EU AI Act adds a separate layer: the AI system
            itself must meet high-risk requirements regardless of whether the
            final decision is automated or human-reviewed. Both regimes apply
            simultaneously.
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-lg font-bold">
            Check your HR AI system now
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Get a precise analysis of your specific tool — whether you&apos;re
            the provider building it or the employer deploying it. Know your
            obligations before August 2026.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get a free compliance report →
            </Link>
            <Link
              href="/articles/26"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Article 26
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
