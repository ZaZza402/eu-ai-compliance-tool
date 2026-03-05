import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "EU AI Act High-Risk AI Checklist — Is Your AI System High-Risk?",
  description:
    "Use this checklist to determine if your AI system is high-risk under the EU AI Act (Annex III, Article 6). Covers all 8 high-risk domains and the Article 6(1) product safety track.",
  openGraph: {
    title: "EU AI Act High-Risk AI Checklist | Regumatrix",
    description:
      "Step-by-step guide to determine if your AI system falls under Annex III high-risk classification or the Article 6(1) product safety track.",
  },
};

const annexDomains = [
  {
    point: "1",
    title: "Biometric identification and categorisation",
    examples:
      "Remote biometric ID, facial recognition in public spaces, emotion recognition",
  },
  {
    point: "2",
    title: "Critical infrastructure",
    examples:
      "AI managing electricity grids, water supply, road traffic, or digital infrastructure",
  },
  {
    point: "3",
    title: "Education and vocational training",
    examples:
      "AI that determines access to education, evaluates students, or informs teacher assessments",
  },
  {
    point: "4",
    title: "Employment and workers management",
    examples:
      "CV screening, candidate ranking, performance monitoring, promotion/demotion AI",
  },
  {
    point: "5a",
    title: "Access to essential private services",
    examples: "Credit scoring, insurance pricing, mortgage approval",
  },
  {
    point: "5b",
    title: "Access to essential public services",
    examples:
      "Benefits entitlement, social services allocation, tax assessment AI",
  },
  {
    point: "6",
    title: "Law enforcement",
    examples:
      "Individual risk assessment, polygraph AI, crime analytics, evidence evaluation",
  },
  {
    point: "7",
    title: "Migration, asylum and border control",
    examples: "Asylum assessment, visa processing AI, border screening",
  },
  {
    point: "8",
    title: "Administration of justice and democracy",
    examples:
      "AI assisting courts, dispute resolution, election integrity tools",
  },
];

const checklists = [
  "Your AI system falls within one of the 8 domains listed in Annex III, AND",
  "It makes, assists in making, or materially influences a decision that affects people's access to opportunities, services, or rights, AND",
  "It is not explicitly exempted under Article 6(3) (e.g. narrow safety components, profile checking against known data)",
];

export default function HighRiskChecklistPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">High-Risk AI Checklist</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act: Is Your AI System High-Risk?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            High-risk classification triggers the most demanding set of
            obligations in the EU AI Act. Use this guide to self-assess whether
            your system falls within Annex III or the Article 6(1) product
            safety track.
          </p>
        </div>

        {/* Two classification tracks */}
        <div className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">
            Two paths to high-risk classification
          </h2>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                Track 1
              </span>
              <h3 className="font-semibold">
                Article 6(1) — Product safety track
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI systems that are <em>safety components</em> of products already
              covered by EU harmonisation legislation (e.g. Machinery
              Regulation, Medical Device Regulation, Aviation safety rules) are
              automatically high-risk and must undergo the conformity assessment
              required by that sectoral legislation.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-950 dark:bg-orange-900/30 dark:text-orange-200">
                Track 2
              </span>
              <h3 className="font-semibold">
                Article 6(2) + Annex III — Standalone high-risk AI
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI systems listed in any of the 8 domains in Annex III are
              high-risk unless an exemption under Article 6(3) applies. All
              three conditions below must be met:
            </p>
            <div className="mt-3 space-y-2">
              {checklists.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Annex III domains */}
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold">
            The 8 high-risk domains (Annex III)
          </h2>
          <div className="space-y-3">
            {annexDomains.map((d) => (
              <div
                key={d.point}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-muted-foreground">
                    {d.point}
                  </span>
                  <div>
                    <div className="font-medium text-sm">{d.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {d.examples}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Read the full list at{" "}
            <Link
              href="/articles/Annex_III"
              className="text-primary hover:underline"
            >
              Annex III
            </Link>{" "}
            and the classification rules at{" "}
            <Link href="/articles/6" className="text-primary hover:underline">
              Article 6
            </Link>
            .
          </p>
        </div>

        {/* Not high-risk */}
        <div className="mb-10 rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-900/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <h2 className="font-semibold text-green-900 dark:text-green-200">
                Article 6(3) exemptions
              </h2>
              <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                Even if your system falls in an Annex III domain, it may be
                exempt if: it performs a narrow procedural task, does not
                influence human decisions, detects patterns in existing data for
                human review only, or is intended for preparatory tasks only.
                Document your exemption reasoning carefully.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-lg font-bold">
            Not sure which tier applies to you?
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Regumatrix analyses your specific AI system description against the
            full regulation and gives you a precise risk classification with
            cited articles — in under a minute.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Check your AI system free →
            </Link>
            <Link
              href="/articles/6"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Article 6
            </Link>
            <Link
              href="/articles/Annex_III"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Annex III
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
