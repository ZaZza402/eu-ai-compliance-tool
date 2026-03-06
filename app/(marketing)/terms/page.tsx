import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Regumatrix — read before using the service.",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed">{children}</p>;
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-4 list-disc space-y-1.5 text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Legal
          </p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Terms of Use
          </h1>
          <p className="text-muted-foreground">
            Effective date: 28 February 2026 &nbsp;·&nbsp; Last updated: 28
            February 2026
          </p>
          <p className="mt-4 rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm text-foreground/80">
            <strong>
              This tool is informational only and does not constitute legal
              advice.
            </strong>{" "}
            Nothing produced by this service creates a solicitor–client or
            attorney–client relationship. Please read these Terms in full before
            using the service.
          </p>
        </div>

        {/* ── Table of contents ─────────────────────────────────────── */}
        <nav className="mb-12 rounded-xl border border-border bg-card p-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contents
          </p>
          <ol className="space-y-1.5 text-sm">
            {[
              ["#service", "1. About the Service"],
              ["#how-it-works", "2. How Analyses Are Generated"],
              ["#not-legal-advice", "3. Not Legal Advice"],
              ["#accounts", "4. Accounts and Credits"],
              ["#payments", "5. Payments and Refunds"],
              ["#acceptable-use", "6. Acceptable Use"],
              ["#ip", "7. Intellectual Property"],
              ["#your-data", "8. Data You Submit"],
              ["#disclaimers", "9. Disclaimers and Limitation of Liability"],
              ["#termination", "10. Account Termination"],
              ["#changes", "11. Changes to These Terms"],
              ["#governing-law", "12. Governing Law"],
              ["#contact", "13. Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Sections ──────────────────────────────────────────────── */}
        <div className="space-y-12">
          {/* 1 */}
          <Section id="service" title="1. About the Service">
            <P>
              Regumatrix (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;) is a web application that helps individuals and
              organisations understand how Regulation (EU) 2024/1689 — the EU AI
              Act — may apply to an AI system they describe in plain text.
            </P>
            <P>
              By creating an account or using any part of the Service, you
              (&ldquo;User&rdquo;, &ldquo;you&rdquo;) agree to be bound by these
              Terms of Use (&ldquo;Terms&rdquo;). If you do not agree, you must
              not use the Service.
            </P>
            <P>
              We reserve the right to modify these Terms at any time. Continued
              use of the Service after a change constitutes your acceptance of
              the revised Terms.
            </P>
          </Section>

          {/* 2 */}
          <Section id="how-it-works" title="2. How Analyses Are Generated">
            <P>
              We disclose the full technical pipeline below so you can make an
              informed judgement about how much weight to give the outputs.
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              2.1 Your input
            </h3>
            <P>
              You submit a plain-text description of your AI system (between 20
              and 5,000 characters). You are responsible for the accuracy and
              completeness of this description. The quality of the analysis is
              directly dependent on the quality of what you provide.
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              2.2 Article retrieval
            </h3>
            <P>
              A deterministic keyword and semantic-matching module scans your
              description and selects up to 30 relevant articles and annexes
              from a structured JSON corpus of Regulation (EU) 2024/1689. This
              corpus encodes all 113 articles and all 13 annexes of the EU AI
              Act. The selected texts serve as grounding context for the AI
              model.
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              2.3 AI model generation
            </h3>
            <P>
              The retrieved article texts, together with a detailed
              legal-analytical system prompt, are submitted to a large language
              model (currently Google Gemini, provided via the Google AI API).
              The model returns a structured JSON output containing the
              following fields:
            </P>
            <Ul
              items={[
                "Scope assessment (Article 2 and Article 3 territorial and definitional analysis)",
                "Risk classification (prohibited / high-risk / limited / GPAI / minimal) with reasoning",
                "Operator role determination (provider / deployer / importer / distributor)",
                "Applicable obligations — article-by-article list with conformity pathway",
                "Key compliance actions, ordered by urgency tier (Immediate / Pre-Market / Ongoing)",
                "Enforcement timeline with dates and in-force status",
                "Penalty exposure under Article 99",
                "Clarifications needed — missing information that would materially change the analysis",
                "GPAI systemic risk flag (where applicable)",
              ]}
            />

            <h3 className="pt-2 font-semibold text-foreground">
              2.4 Storage and PDF export
            </h3>
            <P>
              Each completed analysis is stored in your account history linked
              to your user profile. You may export any analysis as a PDF report
              at any time from your dashboard.
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              2.5 Inherent limitations
            </h3>
            <Ul
              items={[
                <>
                  <strong>Static corpus:</strong> The EU AI Act corpus in this
                  tool reflects the text of Regulation (EU) 2024/1689 as
                  published. Subsequent amendments, delegated acts, implementing
                  acts, or guidance documents issued after our last update may
                  not be reflected.
                </>,
                <>
                  <strong>AI model uncertainty:</strong> Large language models
                  can misinterpret, omit, or hallucinate legal content. Every
                  output, however well-grounded, should be treated as a starting
                  point for professional legal review — not a definitive
                  compliance determination.
                </>,
                <>
                  <strong>Description dependency:</strong> The system has no
                  access to your actual codebase, training data, deployment
                  configuration, or contracts. It analyses only the description
                  you provide. An incomplete or inaccurate description will
                  produce an incomplete or inaccurate analysis.
                </>,
                <>
                  <strong>Jurisdiction specifics:</strong> The EU AI Act
                  requires Member State implementing legislation for certain
                  provisions (notably penalties under Article 99). National
                  variations are outside the scope of this tool.
                </>,
              ]}
            />
          </Section>

          {/* 3 */}
          <Section id="not-legal-advice" title="3. Not Legal Advice">
            <P>
              <strong className="text-foreground">
                The Service does not provide legal advice. Full stop.
              </strong>
            </P>
            <P>
              Every analysis output contains a mandatory disclaimer to this
              effect. Nothing produced by the Service — including any assessment
              of risk classification, applicable obligations, penalty exposure,
              or conformity pathway — constitutes legal advice, legal opinion,
              or a lawyer&rsquo;s professional judgement. No solicitor–client or
              attorney–client relationship is formed by your use of the Service.
            </P>
            <P>
              You should engage qualified legal counsel with expertise in EU AI
              regulation before making compliance decisions, submitting
              regulatory filings, signing EU Declarations of Conformity, or
              relying on any analysis produced by this tool for commercial or
              operational purposes.
            </P>
            <P>
              We accept no liability for any loss, penalty, regulatory
              enforcement action, or other consequence arising from your
              reliance on outputs generated by this Service.
            </P>
          </Section>

          {/* 4 */}
          <Section id="accounts" title="4. Accounts and Credits">
            <P>
              Account creation and authentication are managed by Clerk, Inc. You
              must provide accurate information when registering. You are
              responsible for maintaining the security of your account
              credentials.
            </P>
            <P>
              Each new account receives <strong>3 free analysis credits</strong>{" "}
              upon registration. Each compliance analysis consumes 1 credit.
              Credits purchased in a pack never expire and are non-transferable
              between accounts.
            </P>
            <P>
              We impose rate limits to protect service quality. A maximum of 5
              analysis requests may be submitted within a rolling rate-limit
              window per account. Exceeding this limit will temporarily block
              further requests; the exact window duration is shown in the error
              response.
            </P>
          </Section>

          {/* 5 */}
          <Section id="payments" title="5. Payments and Refunds">
            <P>
              Credit packs are available for one-time purchase through PayPal.
              Prices at the time of writing are:
            </P>
            <Ul
              items={[
                "Pilot — 10 credits for USD 9.00 (USD 0.90 per analysis)",
                "Mission — 40 credits for USD 29.00 (USD 0.73 per analysis)",
                "Command — 120 credits for USD 79.00 (USD 0.66 per analysis)",
              ]}
            />
            <P>
              All prices are in US Dollars and are exclusive of any applicable
              taxes. You are responsible for any taxes levied on your purchase
              by your local jurisdiction.
            </P>
            <P>
              <strong className="text-foreground">Refund policy:</strong>{" "}
              Because credits are a digital good consumed immediately upon use,
              all purchases are final and non-refundable once credits have been
              applied to your account. If a technical failure results in a
              credit being deducted without a completed analysis, please contact
              us and we will restore the credit.
            </P>
            <P>
              We reserve the right to change pricing at any time. Price changes
              do not affect credits already purchased.
            </P>
          </Section>

          {/* 6 */}
          <Section id="acceptable-use" title="6. Acceptable Use">
            <P>You agree not to use the Service to:</P>
            <Ul
              items={[
                "Submit descriptions that contain personally identifiable information about third parties without their consent",
                "Attempt to reverse-engineer, scrape, or systematically extract the EU AI Act corpus, system prompt, or model outputs at scale",
                "Circumvent rate limits, credit checks, or authentication controls through automated means",
                "Use the Service for any purpose that is unlawful or that infringes the rights of others",
                "Represent AI-generated outputs as the opinion or advice of a qualified lawyer to third parties",
                "Resell individual analysis outputs as standalone legal opinions or compliance certificates",
              ]}
            />
            <P>
              We reserve the right to suspend or terminate accounts that breach
              these restrictions without prior notice.
            </P>
          </Section>

          {/* 7 */}
          <Section id="ip" title="7. Intellectual Property">
            <h3 className="pt-2 font-semibold text-foreground">
              7.1 The EU AI Act text
            </h3>
            <P>
              The text of Regulation (EU) 2024/1689 is a public act of the
              European Union and is reproduced here for informational and
              educational purposes under the rules applicable to EU
              publications. The European Union retains all applicable rights in
              the official regulation text. A link to the official EUR-Lex
              publication is always available in the Service navigation.
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              7.2 The Service and its outputs
            </h3>
            <P>
              The software, design, system prompts, retrieval logic, and all
              other proprietary components of the Service are our intellectual
              property. You may not copy, redistribute, or create derivative
              works from these components.
            </P>
            <P>
              Analysis outputs generated for your account are provided for your
              personal or internal business use. You may share, export, or
              include them in internal compliance documentation. You may not
              commercialise individual analysis outputs (e.g. by reselling them
              as legal reports to third parties).
            </P>

            <h3 className="pt-2 font-semibold text-foreground">
              7.3 Your descriptions
            </h3>
            <P>
              You retain all rights in the system descriptions you submit. By
              submitting a description, you grant us a limited licence to
              process it for the sole purpose of generating your analysis and
              storing the result in your account history.
            </P>
          </Section>

          {/* 8 */}
          <Section id="your-data" title="8. Data You Submit">
            <P>
              The following data is stored in association with your account as a
              direct consequence of using the Service:
            </P>
            <Ul
              items={[
                "Your Clerk user profile: user ID, email address, first and last name (if provided), and profile image URL",
                "Each description you submit (stored verbatim as plain text)",
                "The full structured analysis result for each submission (stored as JSON, including all output fields listed in Section 2.3)",
                "Metadata per analysis: risk classification, operator role, articles referenced, credits used, and submission timestamp",
                "Transaction records for credit pack purchases: PayPal order ID, pack name, amount, credit count, and payment status",
                "A credit audit ledger recording every credit addition (sign-up, purchase) and deduction (analysis run)",
              ]}
            />
            <P>
              We do not sell your data to third parties. Your descriptions are
              not used to train or fine-tune AI models. We do not share your
              analysis history with any third party except as required by law or
              as expressly necessary to operate the Service (e.g. the AI model
              API receives your description and retrieved article text to
              generate the analysis).
            </P>
            <P>
              A full Privacy Policy will be published separately and will govern
              data handling, retention periods, your rights under applicable
              data protection law, and cookie use. Please check back for its
              publication.
            </P>
          </Section>

          {/* 9 */}
          <Section
            id="disclaimers"
            title="9. Disclaimers and Limitation of Liability"
          >
            <P>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, express or
              implied, including but not limited to warranties of accuracy,
              fitness for a particular purpose, or non-infringement.
            </P>
            <P>We do not warrant that:</P>
            <Ul
              items={[
                "Analyses will be error-free, complete, or up to date with the latest regulatory guidance",
                "The Service will be uninterrupted or available at all times",
                "The AI model will correctly interpret every factual scenario",
                "Outputs will meet your specific compliance requirements",
              ]}
            />
            <P>
              To the maximum extent permitted by applicable law, our total
              liability to you for any claim arising out of or relating to these
              Terms or your use of the Service shall not exceed the total amount
              you paid to us in the twelve months preceding the claim. In no
              event shall we be liable for any indirect, consequential,
              incidental, special, or punitive damages, including lost profits
              or regulatory penalties.
            </P>
            <P>
              Some jurisdictions do not allow the exclusion or limitation of
              certain warranties or liabilities. In such jurisdictions, our
              liability is limited to the minimum extent permitted by law.
            </P>
          </Section>

          {/* 10 */}
          <Section id="termination" title="10. Account Termination">
            <P>
              You may delete your account at any time through your account
              settings. Upon deletion, your profile and analysis history will be
              permanently removed from our active database. Remaining unused
              credits are forfeited upon account deletion and will not be
              refunded.
            </P>
            <P>
              We may suspend or terminate your account without notice if you
              breach these Terms, engage in fraudulent activity, or if we are
              required to do so by law. In the event of wrongful termination by
              us, your sole remedy shall be a pro-rata refund of unused credits.
            </P>
          </Section>

          {/* 11 */}
          <Section id="changes" title="11. Changes to These Terms">
            <P>
              We may update these Terms at any time. Material changes will be
              notified through the Service interface or by email to your
              registered address. The &ldquo;Last updated&rdquo; date at the top
              of this page reflects the most recent revision. Your continued use
              of the Service after notification constitutes your acceptance of
              the updated Terms.
            </P>
          </Section>

          {/* 12 */}
          <Section id="governing-law" title="12. Governing Law">
            <P>
              These Terms shall be governed by and construed in accordance with
              the laws of Ireland, without regard to its conflict of law
              principles. Any disputes arising under these Terms shall be
              subject to the exclusive jurisdiction of the courts of that
              jurisdiction.
            </P>
            <P>
              If you are a consumer located in the European Union, you may also
              have rights under the mandatory consumer protection laws of your
              country of residence, which these Terms do not override.
            </P>
          </Section>

          {/* 13 */}
          <Section id="contact" title="13. Contact">
            <P>
              For questions about these Terms, billing issues, credit
              restoration requests, or data-related enquiries, please contact us
              at:
            </P>
            <P>
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Contact form →
              </Link>
            </P>
            <P>We aim to respond to all enquiries within 5 business days.</P>
          </Section>
        </div>

        {/* Back to home */}
        <div className="mt-16 border-t border-border/40 pt-8">
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
