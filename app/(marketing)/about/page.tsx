import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Why this tool exists — EU AI Act Compliance Checker",
  description:
    "A developer's honest take on EU AI Act compliance — why this tool was built, what it actually does, and why it's priced the way it is.",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Label */}
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          About this tool
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Built by a developer,
          <br />
          <span className="text-muted-foreground">for developers.</span>
        </h1>

        {/* Byline */}
        <p className="mt-4 text-sm text-muted-foreground">
          A personal note from the founder.
        </p>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-border/60" />

        {/* Body — long-form founder story */}
        <div className="space-y-6 text-[0.9375rem] leading-[1.85] tracking-[-0.01em] text-foreground">
          <p>
            I&apos;m a developer. I build tools. I&apos;ve worked on products
            that touch people&apos;s job applications, their financial data,
            their health records. And for most of that time, the honest answer
            to &ldquo;are we legally compliant?&rdquo; was a shrug and a vague
            reference to a consultant we couldn&apos;t quite afford.
          </p>

          <p>
            The EU AI Act changed that calculation. It&apos;s not optional. It
            doesn&apos;t have a carve-out for startups or indie developers or
            &ldquo;we&apos;re still figuring things out.&rdquo; If your AI
            system touches people in the EU — their employment, their credit,
            their medical treatment, their education — the regulation applies to
            you. Full stop.
          </p>

          <p>
            And when I went looking for something to help me understand where I
            stood, I found two categories of tool on the market.
          </p>

          <p>
            The first category is the free wizard. You click through six
            questions. It tells you whether you&apos;re &ldquo;high risk&rdquo;
            in thirty seconds, based on a decision tree that was probably built
            in an afternoon. No article citations. No nuance. No explanation of{" "}
            <em>why</em>. Just a colour-coded result and a prompt to book a
            demo.
          </p>

          <p>
            The second category is the enterprise audit platform. It asks you to
            fill in your details, your company size, your use case — and then
            someone calls you and sells you a &quot;compliance programme&quot;
            starting at several thousand euros. Which is completely legitimate
            if you need a certified auditor to sign off on your conformity
            assessment. But most developers at the stage of asking &ldquo;am I
            even in scope?&rdquo; don&apos;t need that yet. They need clarity
            first. A starting point. A way to understand what the regulation
            actually says about <em>their specific tool</em>.
          </p>

          <p>That gap is what this tool was built to fill.</p>

          {/* Pull quote */}
          <blockquote className="border-l-4 border-primary pl-5 text-muted-foreground">
            The EU AI Act is 113 articles and 12 annexes. Reading it and mapping
            it to a specific AI system takes a trained legal mind several hours.
            I wanted a tool that could do that grounding work in under a minute
            — not with a decision tree, but by actually reading the regulation.
          </blockquote>

          <p>
            So I built it. The engine retrieves the relevant articles from the
            full corpus, builds a grounded legal context, and runs a structured
            7-section analysis — risk classification, operator role, applicable
            obligations, key actions with deadlines, a compliance timeline, and
            penalty exposure — with every single claim cited to the actual
            regulation. Article numbers. Annex references. The real text, not a
            summary of a summary.
          </p>

          <p>
            It won&apos;t replace a qualified legal opinion when you need one.
            It will tell you, very quickly, whether you need one at all — and if
            so, exactly which articles to take to your lawyer.
          </p>

          <p>
            That&apos;s the intention. Reduce the fear. Replace the shrug with a
            starting point. And keep it honest: this is a screening tool, not a
            compliance certificate. The disclaimer is in the footer, and I mean
            it.
          </p>
        </div>

        {/* About pricing — second section */}
        <div className="my-12 h-px w-full bg-border/60" />

        <h2 className="mb-6 text-2xl font-bold tracking-tight">On the price</h2>

        <div className="space-y-6 text-[0.9375rem] leading-[1.85] tracking-[-0.01em] text-foreground">
          <p>
            The prices exist to keep this tool online and maintained.
            That&apos;s genuinely it. I&apos;m not trying to build a SaaS empire
            on compliance anxiety.
          </p>

          <p>
            To put it in perspective: a professional pre-screening engagement —
            the kind where an expert gets on a call, asks you what your tool
            does, and maps it to the relevant framework — starts at around €500.
            That&apos;s for the discovery call. The part where they figure out
            what you&apos;ve already built, before any actual compliance work
            begins.
          </p>

          <p>
            For the cost of that one call, you can run over 500 analyses here.
            That&apos;s not a comparison I make to dismiss professional legal
            counsel — it&apos;s worth every cent when you need it. It&apos;s a
            comparison I make to be honest about what this tool costs relative
            to the alternative, and what it&apos;s actually worth as a starting
            point.
          </p>

          <p>
            Three analyses are free on every new account. No credit card
            required. If it&apos;s not useful, you&apos;ve lost nothing.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-foreground">
            Have a thought, a question, or a complaint?
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Honest feedback makes this tool better. If it helped you, I&apos;d
            love to know. If it failed you, I need to know.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/feedback"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Leave feedback →
            </Link>
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                Try it free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/analyze"
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                Run an analysis
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Back */}
        <div className="mt-10 border-t border-border/40 pt-8">
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
