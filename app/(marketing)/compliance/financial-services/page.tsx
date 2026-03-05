import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "EU AI Act Compliance for Financial Services AI",
  description:
    "Credit scoring, fraud detection, algorithmic trading, and insurance risk AI are high-risk under the EU AI Act. Understand your provider and deployer obligations under Articles 9-17.",
  openGraph: {
    title: "EU AI Act — Financial Services AI Compliance | Regumatrix",
    description:
      "AI used in creditworthiness assessment and financial decisions is high-risk under Annex III(5b). Check your obligations before August 2026.",
  },
};

const obligations = [
  {
    art: "Art. 9",
    text: "Risk management system addressing model risk, fairness and over-reliance",
  },
  {
    art: "Art. 10",
    text: "Training data governance: representative, no historical bias encoding",
  },
  {
    art: "Art. 11",
    text: "Technical documentation — maintained and available to supervisors",
  },
  {
    art: "Art. 12",
    text: "Automatic logging sufficient for supervisory authority audit trail",
  },
  {
    art: "Art. 13",
    text: "Transparency: customers must understand when AI is used in decisions affecting them",
  },
  {
    art: "Art. 14",
    text: "Human oversight — AI must not autonomously approve or deny credit without oversight",
  },
  {
    art: "Art. 22",
    text: "Where natural persons are involved, right to explanation for AI-assisted decisions",
  },
  {
    art: "Art. 43",
    text: "Conformity assessment before placing the AI system on the market",
  },
];

export default function FinancialServicesPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Financial Services AI</span>
        </nav>

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-950 dark:bg-orange-900/30 dark:text-orange-200">
            High Risk — Annex III, Points 5(b) &amp; 6
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act: Financial Services AI Compliance
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI systems used in creditworthiness assessment, insurance risk
            pricing, and financial decision-making affecting natural persons are{" "}
            <strong>high-risk under Annex III, points 5(b) and 6</strong>.
            Mandatory obligations apply from August 2026.
          </p>
        </div>

        <div className="mb-10 rounded-xl border border-orange-300 bg-orange-50 p-6 dark:border-orange-700/40 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <h2 className="font-semibold text-foreground">
                High-risk financial AI systems
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                {[
                  "Credit scoring and creditworthiness assessment AI",
                  "Insurance risk classification and pricing models",
                  "Fraud detection affecting account access decisions",
                  "AI for loan approval or rejection",
                  "AI used in the administration of social benefit entitlements",
                  "AI for collateral value assessment with binding outputs",
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
            Obligations for financial AI providers and deployers
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
          <h2 className="mb-2 font-semibold">DORA &amp; GDPR overlap</h2>
          <p className="text-sm text-muted-foreground">
            Financial entities are already subject to DORA (Digital Operational
            Resilience Act) and GDPR Article 22 on automated decision-making.
            The EU AI Act adds a third compliance layer: the AI system itself
            must pass high-risk conformity requirements regardless of existing
            DORA or GDPR controls. These frameworks are complementary, not
            substitutable.
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-lg font-bold">
            Check your financial AI system
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Get a precise analysis of your specific tool — credit scoring, fraud
            detection, or insurance pricing. Know your exact obligations before
            the August 2026 deadline.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get a free compliance report →
            </Link>
            <Link
              href="/articles/9"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Article 9
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
