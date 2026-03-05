import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "EU AI Act Compliance for Healthcare AI Systems",
  description:
    "Healthcare AI systems under the EU AI Act: risk classification, high-risk obligations, Article 22 explainability, and what medical AI providers must do before 2026. Free compliance check.",
  openGraph: {
    title: "EU AI Act — Healthcare AI Compliance Guide | Regumatrix",
    description:
      "Is your medical AI system high-risk under the EU AI Act? Understand Article 6, Annex III, and the obligations that apply to healthcare AI providers and deployers.",
  },
};

const obligations = [
  {
    art: "Art. 9",
    text: "Maintain a documented risk management system throughout the AI lifecycle",
  },
  {
    art: "Art. 10",
    text: "Ensure training data is relevant, representative, and free from errors",
  },
  {
    art: "Art. 11",
    text: "Prepare and keep technical documentation before market placement",
  },
  {
    art: "Art. 13",
    text: "Ensure transparency and provide instructions for use to deployers",
  },
  {
    art: "Art. 14",
    text: "Design for effective human oversight — overridable by qualified staff",
  },
  {
    art: "Art. 15",
    text: "Achieve appropriate accuracy, robustness, and cybersecurity",
  },
  {
    art: "Art. 17",
    text: "Implement a quality management system covering the full AI lifecycle",
  },
  {
    art: "Art. 43",
    text: "Undergo conformity assessment (notified body or internal control)",
  },
  {
    art: "Art. 49",
    text: "Register the AI system in the EU database before deployment",
  },
];

export default function HealthcareAIPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Healthcare AI</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            High Risk — Annex III, Point 5
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act Compliance for Healthcare AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI systems used in medical diagnosis, treatment recommendation,
            patient triage, or clinical decision support are classified as{" "}
            <strong>high-risk under Annex III, point 5</strong> of the EU AI
            Act. This triggers a comprehensive set of mandatory obligations.
          </p>
        </div>

        {/* Risk context */}
        <div className="mb-10 rounded-xl border border-orange-300 bg-orange-50 p-6 dark:border-orange-700/40 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <h2 className="font-semibold text-orange-900 dark:text-orange-200">
                Affected systems under Annex III(5)
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-300">
                {[
                  "AI-assisted diagnostic imaging and pathology tools",
                  "Clinical decision support systems (CDSS)",
                  "Patient triage and risk stratification tools",
                  "AI for monitoring vital signs or predicting deterioration",
                  "Surgical robotics with autonomous decision capability",
                  "Predictive tools for treatment selection or drug dosing",
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

        {/* Obligations */}
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold">
            Mandatory obligations for healthcare AI providers
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

        {/* Deployer note */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">
            Are you a deployer (e.g. hospital)?
          </h2>
          <p className="text-sm text-muted-foreground">
            Hospitals and clinical settings deploying third-party AI tools are{" "}
            <strong>deployers</strong> under Article 3(4). You still carry
            obligations under Articles 26 (fundamental rights impact
            assessment), 29 (use as intended), and 30 (logging and
            post-deployment monitoring). The provider&apos;s CE marking and
            technical documentation do not eliminate your own obligations.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Key compliance deadlines</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="font-mono font-semibold text-primary w-24 shrink-0">
                Aug 2025
              </span>
              <span>Prohibited AI practices ban in force</span>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-semibold text-primary w-24 shrink-0">
                Aug 2026
              </span>
              <span>
                High-risk obligations fully applicable — including healthcare AI
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-semibold text-primary w-24 shrink-0">
                Aug 2027
              </span>
              <span>GPAI model rules in force</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-lg font-bold">
            Check your healthcare AI system now
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Describe your specific system and get a precise analysis: risk tier,
            your exact role, which articles apply, and the mandatory actions you
            need to take.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get a free compliance report →
            </Link>
            <Link
              href="/articles/6"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Article 6
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
