import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Regumatrix",
  description:
    "How we collect, use, and protect your personal data. GDPR-compliant privacy policy for Regumatrix.",
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

function TableRow({
  category,
  data,
  purpose,
  basis,
  retention,
}: {
  category: string;
  data: string;
  purpose: string;
  basis: string;
  retention: string;
}) {
  return (
    <tr className="border-b border-border text-sm last:border-0">
      <td className="py-3 pr-4 font-medium text-foreground">{category}</td>
      <td className="py-3 pr-4 text-muted-foreground">{data}</td>
      <td className="py-3 pr-4 text-muted-foreground">{purpose}</td>
      <td className="py-3 pr-4 text-muted-foreground">{basis}</td>
      <td className="py-3 text-muted-foreground">{retention}</td>
    </tr>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Legal
          </p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Effective date: 28 February 2026 &nbsp;·&nbsp; Last updated: 28
            February 2026
          </p>
        </div>

        {/* TOC */}
        <nav className="mb-12 rounded-xl border border-border bg-muted/30 p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contents
          </p>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            {[
              ["#controller", "1. Who we are"],
              ["#data-we-collect", "2. Data we collect"],
              ["#how-we-use", "3. How we use your data"],
              ["#legal-bases", "4. Legal bases (GDPR)"],
              ["#third-parties", "5. Third-party services"],
              ["#analytics", "6. Analytics"],
              ["#cookies", "7. Cookies"],
              ["#retention", "8. Data retention"],
              ["#your-rights", "9. Your rights"],
              ["#transfers", "10. International transfers"],
              ["#security", "11. Security"],
              ["#children", "12. Children"],
              ["#changes", "13. Changes to this policy"],
              ["#contact", "14. Contact"],
            ].map(([href, label]) => (
              <li key={href as string}>
                <a
                  href={href as string}
                  className="transition-colors hover:text-foreground"
                >
                  {label as string}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Intro callout */}
        <div className="mb-12 rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-muted-foreground">
            We take your privacy seriously. This policy explains what personal
            data we collect when you use Regumatrix, why we collect it, how long
            we keep it, and what rights you have. This policy complies with the
            General Data Protection Regulation (GDPR) and the Irish Data
            Protection Acts 1988–2018.
          </p>
        </div>

        <div className="space-y-12 text-sm">
          {/* 1 */}
          <Section id="controller" title="1. Who we are (Data Controller)">
            <P>
              The data controller for Regumatrix is the operator of this
              service, reachable via our{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                contact form
              </Link>
              . Where GDPR applies, you have the rights set out in Section 9
              below.
            </P>
          </Section>

          {/* 2 */}
          <Section id="data-we-collect" title="2. Data we collect">
            <P>
              We collect only what is necessary to provide the service. The
              table below summarises each category.
            </P>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {[
                      "Category",
                      "Data",
                      "Purpose",
                      "Legal basis",
                      "Retention",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border px-4">
                  <TableRow
                    category="Account"
                    data="Name, email address"
                    purpose="Authentication; account management; transactional email"
                    basis="Contract"
                    retention="Until account deleted + 30 days"
                  />
                  <TableRow
                    category="AI queries"
                    data="Free-text system descriptions you submit"
                    purpose="Generating compliance analyses; saving to History"
                    basis="Contract"
                    retention="Until you delete the record or close your account"
                  />
                  <TableRow
                    category="Analysis results"
                    data="Structured JSON output of each analysis"
                    purpose="Displaying analysis history; PDF export"
                    basis="Contract"
                    retention="Same as AI queries above"
                  />
                  <TableRow
                    category="Payments"
                    data="Transaction ID, pack name, amount, timestamp"
                    purpose="Credit allocation; purchase history display"
                    basis="Contract / Legal obligation"
                    retention="7 years (accounting law)"
                  />
                  <TableRow
                    category="Credit events"
                    data="Credit type, amount, timestamp"
                    purpose="Credit balance management; dispute resolution"
                    basis="Contract"
                    retention="3 years"
                  />
                  <TableRow
                    category="Analytics"
                    data="Anonymised page views, session count, referrer"
                    purpose="Understanding usage to improve the product"
                    basis="Legitimate interest / Consent (cookie)"
                    retention="26 months"
                  />
                  <TableRow
                    category="Technical logs"
                    data="IP address (truncated), user-agent, timestamp"
                    purpose="Security; error diagnosis"
                    basis="Legitimate interest"
                    retention="30 days"
                  />
                </tbody>
              </table>
            </div>

            <P>
              We do not collect sensitive personal data (Article 9 GDPR
              categories) and we do not use your AI system descriptions for any
              purpose other than generating your compliance analysis and storing
              it in your History.
            </P>
          </Section>

          {/* 3 */}
          <Section id="how-we-use" title="3. How we use your data">
            <Ul
              items={[
                "To create and manage your account.",
                "To run compliance analyses against the EU AI Act corpus and return structured results.",
                "To store your analysis history so you can revisit and export past results.",
                "To process credit purchases and maintain your credit balance.",
                "To send transactional emails (e.g. purchase confirmation, account-related notices). We do not send unsolicited marketing email.",
                "To measure aggregate usage (page views, feature adoption) using anonymised analytics so we can improve the product.",
                "To detect and prevent abuse, fraud, or unauthorised access.",
              ]}
            />
          </Section>

          {/* 4 */}
          <Section id="legal-bases" title="4. Legal bases (GDPR Art. 6)">
            <P>
              For each processing activity we rely on one of the following legal
              bases under Article 6 GDPR:
            </P>
            <Ul
              items={[
                <>
                  <strong className="text-foreground">
                    Performance of a contract (Art. 6(1)(b)):
                  </strong>{" "}
                  Providing the analysis service, storing history, processing
                  payments, and maintaining credit balances.
                </>,
                <>
                  <strong className="text-foreground">
                    Legal obligation (Art. 6(1)(c)):
                  </strong>{" "}
                  Retaining financial records for the period required by Irish
                  accounting and tax law.
                </>,
                <>
                  <strong className="text-foreground">
                    Legitimate interests (Art. 6(1)(f)):
                  </strong>{" "}
                  Security logging (truncated IPs, error logs) and aggregate
                  analytics where consent is not obtained via cookie
                  preferences. Our legitimate interest is to protect the service
                  and understand product usage. We have assessed that these
                  interests are not overridden by your rights.
                </>,
                <>
                  <strong className="text-foreground">
                    Consent (Art. 6(1)(a)):
                  </strong>{" "}
                  Analytics cookies placed by our analytics provider. You can
                  withdraw consent at any time via the cookie preferences button
                  on our website.
                </>,
              ]}
            />
          </Section>

          {/* 5 */}
          <Section id="third-parties" title="5. Third-party service providers">
            <P>
              We share personal data with the following sub-processors strictly
              for the purpose of providing the service. All sub-processors are
              bound by data processing agreements.
            </P>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {["Provider", "Purpose", "Location"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [
                      "Clerk",
                      "Authentication, user identity management",
                      "USA (SCCs + DPF)",
                    ],
                    [
                      "Supabase / PostgreSQL",
                      "Database hosting (account data, analyses, transactions)",
                      "EU (eu-west-1)",
                    ],
                    [
                      "Google (Gemini API)",
                      "AI analysis generation — queries are not used to train Google models under our enterprise terms",
                      "USA (SCCs)",
                    ],
                    [
                      "PayPal",
                      "Payment processing — we receive only a transaction confirmation, not card details",
                      "USA (SCCs + DPF)",
                    ],
                    [
                      "Vercel",
                      "Application hosting and edge infrastructure",
                      "EU + USA (SCCs)",
                    ],
                  ].map(([provider, purpose, location]) => (
                    <tr key={provider} className="text-sm">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {provider}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {purpose}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              We do not sell your personal data to third parties. We do not
              share your AI system descriptions or analysis results with any
              third party except the AI generation provider named above, which
              processes them solely to generate your analysis.
            </P>
          </Section>

          {/* 6 */}
          <Section id="analytics" title="6. Analytics">
            <P>
              We use privacy-friendly, cookieless page-view analytics to
              understand how the product is used — which pages are visited, how
              users navigate the analysis flow, and where sessions end. This
              data is aggregated and anonymised prior to storage; we cannot
              identify individual users from it.
            </P>
            <P>
              If our analytics implementation uses cookies (first-party or
              third-party), it will only activate after you accept analytics
              cookies via the cookie consent banner. You can withdraw consent at
              any time via the cookie preferences button (bottom-left of the
              site).
            </P>
            <P>
              Analytics data is retained for up to 26 months and is never shared
              with advertising networks.
            </P>
          </Section>

          {/* 7 */}
          <Section id="cookies" title="7. Cookies">
            <P>
              We use a minimal set of cookies. The table below describes each
              type.
            </P>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {["Cookie / Storage", "Type", "Purpose", "Expires"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    [
                      "__clerk_*",
                      "Strictly necessary",
                      "Authentication session token (Clerk)",
                      "Session / 1 year",
                    ],
                    [
                      "__session",
                      "Strictly necessary",
                      "Authenticated session (Clerk)",
                      "Session",
                    ],
                    [
                      "eu_cookie_consent",
                      "Strictly necessary",
                      "Records your cookie preferences so we don't re-ask on every visit",
                      "1 year",
                    ],
                    [
                      "eu_ai_last_description",
                      "Functional (localStorage)",
                      "Persists your last analysis description so you don't lose it on refresh",
                      "Until cleared",
                    ],
                    [
                      "_analytics_*",
                      "Analytics (consent required)",
                      "Anonymised page-view and session analytics",
                      "26 months",
                    ],
                    [
                      "theme",
                      "Functional (localStorage)",
                      "Remembers your light/dark mode preference",
                      "Indefinite",
                    ],
                  ].map(([name, type, purpose, expires]) => (
                    <tr key={name as string} className="text-sm">
                      <td className="px-4 py-3 font-mono text-[11px] text-foreground">
                        {name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {purpose}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {expires}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P>
              You can manage your cookie preferences at any time using the
              cookie settings button on the bottom-left of every marketing page,
              or by clearing cookies in your browser settings.
            </P>
          </Section>

          {/* 8 */}
          <Section id="retention" title="8. Data retention">
            <P>
              We retain personal data only for as long as necessary for the
              purpose it was collected and to comply with applicable legal
              obligations. When you delete your account, all associated personal
              data (account details, analysis history, credit records) is
              deleted within 30 days, except financial transaction records which
              we retain for 7 years as required by law.
            </P>
            <P>
              You can delete individual analyses at any time from your History
              page without closing your account.
            </P>
          </Section>

          {/* 9 */}
          <Section id="your-rights" title="9. Your rights (GDPR)">
            <P>
              Under GDPR you have the following rights regarding your personal
              data. To exercise any right, use our{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                contact form
              </Link>
              . We will respond within 30 days.
            </P>
            <Ul
              items={[
                <>
                  <strong className="text-foreground">Access (Art. 15):</strong>{" "}
                  Request a copy of the personal data we hold about you.
                </>,
                <>
                  <strong className="text-foreground">
                    Rectification (Art. 16):
                  </strong>{" "}
                  Ask us to correct inaccurate data.
                </>,
                <>
                  <strong className="text-foreground">
                    Erasure (Art. 17):
                  </strong>{" "}
                  Ask us to delete your data ("right to be forgotten"), subject
                  to legal retention obligations.
                </>,
                <>
                  <strong className="text-foreground">
                    Restriction (Art. 18):
                  </strong>{" "}
                  Ask us to restrict processing while a dispute is pending.
                </>,
                <>
                  <strong className="text-foreground">
                    Portability (Art. 20):
                  </strong>{" "}
                  Receive your data in a structured, machine-readable format.
                </>,
                <>
                  <strong className="text-foreground">Object (Art. 21):</strong>{" "}
                  Object to processing based on legitimate interests, including
                  profiling.
                </>,
                <>
                  <strong className="text-foreground">
                    Withdraw consent (Art. 7(3)):
                  </strong>{" "}
                  Where processing is based on consent (e.g. analytics cookies),
                  withdraw at any time via cookie preferences. Withdrawal does
                  not affect prior lawful processing.
                </>,
                <>
                  <strong className="text-foreground">
                    Lodge a complaint:
                  </strong>{" "}
                  You have the right to lodge a complaint with the Irish Data
                  Protection Commission (DPC) at{" "}
                  <a
                    href="https://www.dataprotection.ie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-2"
                  >
                    www.dataprotection.ie
                  </a>
                  , or with the supervisory authority in your EU member state.
                </>,
              ]}
            />
          </Section>

          {/* 10 */}
          <Section id="transfers" title="10. International transfers">
            <P>
              Some of our sub-processors are based outside the European Economic
              Area (EEA), specifically in the United States. Where transfers
              occur, we rely on one or more of the following safeguards:
            </P>
            <Ul
              items={[
                "EU Standard Contractual Clauses (SCCs) — Commission Decision 2021/914.",
                "EU–US Data Privacy Framework (DPF) — for providers certified under the DPF.",
              ]}
            />
            <P>
              You can request a copy of the relevant safeguards by contacting us
              at the address in Section 14.
            </P>
          </Section>

          {/* 11 */}
          <Section id="security" title="11. Security">
            <P>
              We implement technical and organisational measures appropriate to
              the risk including:
            </P>
            <Ul
              items={[
                "TLS encryption in transit for all data.",
                "Encrypted storage provided by Supabase (AES-256 at rest).",
                "Row-level security: each user can only access their own analyses.",
                "Authentication delegated to Clerk, a dedicated identity provider with MFA support.",
                "Access to production infrastructure is limited to authorised personnel only.",
              ]}
            />
            <P>
              No method of transmission over the internet is 100% secure. If you
              believe your account has been compromised, contact us immediately
              via our{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                contact form
              </Link>
              .
            </P>
          </Section>

          {/* 12 */}
          <Section id="children" title="12. Children">
            <P>
              The service is not directed at children under the age of 16. We do
              not knowingly collect personal data from children. If you believe
              a child has provided us with personal data, please contact us and
              we will delete it promptly.
            </P>
          </Section>

          {/* 13 */}
          <Section id="changes" title="13. Changes to this policy">
            <P>
              We may update this Privacy Policy. Material changes will be
              notified by updating the effective date above and, where
              appropriate, by email to registered users. Continued use of the
              service after the effective date constitutes acceptance of the
              updated policy.
            </P>
          </Section>

          {/* 14 */}
          <Section id="contact" title="14. Contact">
            <P>
              For any questions about this policy or to exercise a data right,
              contact us at:
            </P>
            <P>
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Contact form →
              </Link>
            </P>
            <P>
              Supervisory authority: Data Protection Commission Ireland, 21
              Fitzwilliam Square South, Dublin 2, D02 RD28.
              <br />
              <a
                href="https://www.dataprotection.ie"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
              >
                www.dataprotection.ie
              </a>
            </P>
          </Section>
        </div>

        {/* Back links */}
        <div className="mt-16 flex flex-wrap items-center gap-6 border-t border-border/40 pt-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            ← Back to home
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </div>
  );
}
