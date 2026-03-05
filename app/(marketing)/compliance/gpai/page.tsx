import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "EU AI Act GPAI Compliance — General-Purpose AI Model Obligations",
  description:
    "GPAI model providers (GPT-4, Claude, Gemini, open-source LLMs) have specific obligations under EU AI Act Articles 51–55. Understand systemic risk, transparency, and downstream provider rules.",
  openGraph: {
    title: "EU AI Act GPAI Model Obligations | Regumatrix",
    description:
      "Are you a GPAI model provider? Articles 51-55 set out your transparency, capability evaluation, and systemic risk obligations. Check your compliance now.",
  },
};

const obligations = [
  {
    art: "Art. 51",
    text: "Classify your GPAI model — determine if it has systemic risk (≥10²⁵ FLOPs threshold)",
  },
  {
    art: "Art. 52",
    text: "Provide technical documentation and training summaries — make available to downstream providers",
  },
  {
    art: "Art. 53",
    text: "Comply with EU copyright law; publish training data summary for rights-holder requests",
  },
  {
    art: "Art. 54",
    text: "For systemic risk models: adversarial testing, incident reporting, cybersecurity measures",
  },
  {
    art: "Art. 55",
    text: "Systemic risk models must notify the AI Office; ongoing model evaluation obligations apply",
  },
  {
    art: "Art. 56",
    text: "Codes of practice — GPAI providers may adopt or contribute to Commission-approved codes",
  },
];

const downstreamObligations = [
  "Obtain technical documentation from the GPAI provider before building on their model",
  "Understand which provider obligations flow down to your integration (Art. 25)",
  "If your downstream AI system is high-risk, you remain responsible for Chapters III obligations",
  "Document which model version you used and when",
];

export default function GPAIPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">GPAI Obligations</span>
        </nav>

        <div className="mb-10">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            GPAI — Articles 51–55
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act: GPAI Model Provider Obligations
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            General-Purpose AI (GPAI) models — large language models, multimodal
            foundation models, and other models capable of serving a wide range
            of tasks — are subject to a dedicated chapter in the EU AI Act.
            Obligations differ based on whether your model poses{" "}
            <strong>systemic risk</strong>.
          </p>
        </div>

        {/* What is a GPAI model */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">
            What is a GPAI model? (Article 3(63))
          </h2>
          <p className="text-sm text-muted-foreground">
            A model trained on large amounts of data using self-supervision at
            scale, that displays <em>significant generality</em> and is capable
            of competently performing a wide range of distinct tasks. This
            includes GPT-4 class models, Claude, Gemini, Llama, Mistral, and
            other large foundation models. Crucially, models used only for
            research and not yet placed on the market are{" "}
            <strong>excluded</strong>.
          </p>
        </div>

        {/* Systemic risk threshold */}
        <div className="mb-10 rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-700/40 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <h2 className="font-semibold text-amber-900 dark:text-amber-200">
                Systemic risk threshold
              </h2>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                A GPAI model is presumed to pose <strong>systemic risk</strong>{" "}
                if it was trained using a compute of more than{" "}
                <strong>10²⁵ floating-point operations (FLOPs)</strong> (Article
                51(1)). The AI Office may also designate models as systemic risk
                based on capability evaluation. Systemic-risk models face
                significantly elevated obligations under Articles 54 and 55.
              </p>
            </div>
          </div>
        </div>

        {/* Obligations */}
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-bold">
            GPAI provider obligations (Articles 51–55)
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

        {/* Downstream providers */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">
            Building on a GPAI model? (Downstream provider obligations)
          </h2>
          <div className="space-y-2">
            {downstreamObligations.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-foreground/90">{d}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            See{" "}
            <Link href="/articles/25" className="text-primary hover:underline">
              Article 25
            </Link>{" "}
            for the provider chain responsibility allocation.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-2 text-lg font-bold">
            Check your GPAI model&apos;s obligations
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Whether you&apos;re developing a foundation model or building a
            product on top of one, Regumatrix can tell you exactly which GPAI
            obligations apply to your specific situation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Get a free compliance report →
            </Link>
            <Link
              href="/articles/51"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm hover:bg-accent"
            >
              Read Article 51
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
