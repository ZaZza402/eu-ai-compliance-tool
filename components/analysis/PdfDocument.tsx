/**
 * PdfDocument
 * ===========
 * React-PDF document definition for EU AI Act compliance reports.
 * Server-only — used exclusively in /api/export-pdf route.
 *
 * Generates real text-based PDFs using @react-pdf/renderer.
 * NO canvas, NO screenshots — pure vector text and layout.
 *
 * Exports:
 *   ComplianceReportPdf         — legacy (v1) markdown-based report
 *   StructuredComplianceReportPdf — v2 typed-data report
 */

import React from "react";
import {
  type StoredStructuredResult,
  RISK_LABELS,
  ROLE_LABELS,
  TIER_LABELS,
} from "@/lib/analysis-schema";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfProps {
  systemDescription: string;
  analysisMarkdown: string;
  citedArticles: string[];
  riskLevel: string | null;
  generatedAt: string; // ISO date string
}

// ---------------------------------------------------------------------------
// Fonts — use built-in Helvetica family (no async fetch needed)
// ---------------------------------------------------------------------------

Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------

const COLOR = {
  navy: "#0f172a",
  bodyText: "#1e293b",
  mutedText: "#64748b",
  border: "#e2e8f0",
  bgGray: "#f8fafc",
  primary: "#1e40af",
  red: "#dc2626",
  orange: "#c2410c",
  amber: "#b45309",
  blue: "#1d4ed8",
  green: "#15803d",
  white: "#ffffff",
} as const;

const RISK_COLOR: Record<string, string> = {
  prohibited: COLOR.red,
  high_risk: COLOR.orange,
  limited: COLOR.amber,
  gpai: COLOR.blue,
  minimal: COLOR.green,
};

const RISK_LABEL: Record<string, string> = {
  prohibited: "PROHIBITED",
  high_risk: "HIGH-RISK",
  limited: "LIMITED TRANSPARENCY",
  gpai: "GENERAL-PURPOSE AI (GPAI)",
  minimal: "MINIMAL RISK",
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLOR.bodyText,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
    lineHeight: 1.5,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: COLOR.primary,
    paddingBottom: 12,
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "column", gap: 2, maxWidth: "70%" },
  headerLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: COLOR.mutedText,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    lineHeight: 1.2,
  },
  headerRight: { flexDirection: "column", alignItems: "flex-end", gap: 2 },
  headerDate: { fontSize: 7.5, color: COLOR.mutedText },
  headerConfidential: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.mutedText,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    borderWidth: 0.5,
    borderColor: COLOR.mutedText,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginTop: 2,
  },

  // ── Risk badge ───────────────────────────────────────────────────────────
  riskBadgeWrapper: {
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  riskBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskBadgeLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  riskBadgeTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.2,
  },

  // ── Description box ─────────────────────────────────────────────────────
  descBox: {
    backgroundColor: COLOR.bgGray,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderRadius: 2,
  },
  descBoxLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.mutedText,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  descBoxText: {
    fontSize: 8.5,
    color: COLOR.bodyText,
    lineHeight: 1.6,
    fontFamily: "Helvetica-Oblique",
  },

  // ── Section ─────────────────────────────────────────────────────────────
  sectionWrapper: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  sectionNumber: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.white,
    backgroundColor: COLOR.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    flex: 1,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: COLOR.border,
    marginBottom: 8,
  },

  // ── Body content ─────────────────────────────────────────────────────────
  paragraph: {
    fontSize: 9,
    color: COLOR.bodyText,
    lineHeight: 1.65,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: { fontSize: 9, color: COLOR.primary, width: 8, flexShrink: 0 },
  bulletText: { fontSize: 9, color: COLOR.bodyText, lineHeight: 1.6, flex: 1 },

  // Priority tier tags
  tierImmediate: {
    fontFamily: "Helvetica-Bold",
    color: COLOR.red,
  },
  tierPreMarket: {
    fontFamily: "Helvetica-Bold",
    color: COLOR.amber,
  },
  tierOngoing: {
    fontFamily: "Helvetica-Bold",
    color: COLOR.green,
  },

  // Classification / Role highlight lines
  classificationLine: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    lineHeight: 1.5,
  },

  // ── Article citations strip ─────────────────────────────────────────────
  articlesWrapper: {
    marginTop: 4,
    marginBottom: 20,
    backgroundColor: COLOR.bgGray,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
  },
  articlesLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.mutedText,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  articlesRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  articlePill: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.primary,
    borderWidth: 0.5,
    borderColor: COLOR.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  // IMPORTANT: bottom:0 + height equal to page paddingBottom is the only
  // reliable way to keep an absolutely-positioned fixed footer at the
  // physical page bottom in react-pdf. Using bottom:24 (or any non-zero value)
  // causes the yoga engine to drift the footer upward on later pages because
  // it computes the offset from an accumulated document-height reference
  // rather than resetting it per-page.
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56, // matches page paddingBottom exactly
    paddingHorizontal: 52, // matches page paddingHorizontal
    paddingTop: 10, // breathing room above text (border sits here)
    borderTopWidth: 0.5,
    borderTopColor: COLOR.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerLeft: { flexDirection: "column", gap: 1.5, maxWidth: "80%" },
  footerDisclaimer: { fontSize: 6.5, color: COLOR.mutedText, lineHeight: 1.5 },
  footerLogo: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.mutedText,
    letterSpacing: 0.3,
  },
  footerPage: { fontSize: 7, color: COLOR.mutedText },
});

// ---------------------------------------------------------------------------
// Markdown parsing utilities (PDF-specific — no DOM)
// ---------------------------------------------------------------------------

interface ParsedLine {
  type: "paragraph" | "bullet" | "classification" | "divider";
  text: string;
}

/** Strip markdown bold/italic markers from a string. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

/** Detect if a line is a priority tier line and return the tier key. */
function detectTier(
  text: string,
): "immediate" | "premarket" | "ongoing" | null {
  if (/\[🔴\s*IMMEDIATE\]/i.test(text)) return "immediate";
  if (/\[🟡\s*PRE-MARKET\]/i.test(text)) return "premarket";
  if (/\[🟢\s*ONGOING\]/i.test(text)) return "ongoing";
  return null;
}

/** Parse a section body into renderable line objects. */
function parseBody(body: string): ParsedLine[] {
  const lines = body.split("\n");
  const result: ParsedLine[] = [];

  let currentParagraph = "";

  const flush = () => {
    const trimmed = currentParagraph.trim();
    if (!trimmed) return;
    const clean = stripInlineMarkdown(trimmed);
    if (/^\*\*(CLASSIFICATION|ROLE):/i.test(trimmed)) {
      result.push({ type: "classification", text: clean });
    } else {
      result.push({ type: "paragraph", text: clean });
    }
    currentParagraph = "";
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "" || line === "---") {
      flush();
      if (line === "---") result.push({ type: "divider", text: "" });
      continue;
    }

    // Bullet items: `- text`, `* text`, `• text`, or `1. text`
    const bulletMatch = line.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      flush();
      result.push({
        type: "bullet",
        text: stripInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    currentParagraph += (currentParagraph ? " " : "") + line;
  }

  flush();
  return result;
}

/** Parse the full markdown into sections by ### headers. */
function parseMarkdownSections(
  markdown: string,
): Array<{ num: string; title: string; body: string }> {
  const parts = markdown.split(/^### /m);
  const sections: Array<{ num: string; title: string; body: string }> = [];

  for (const part of parts) {
    if (!part.trim()) continue;
    const newlineIdx = part.indexOf("\n");
    if (newlineIdx === -1) continue;
    const rawTitle = part.slice(0, newlineIdx).trim();
    const body = part.slice(newlineIdx + 1).trim();

    // Extract leading number "1. Scope Assessment" → num="1", title="Scope Assessment"
    const numMatch = rawTitle.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      sections.push({ num: numMatch[1], title: numMatch[2], body });
    } else {
      sections.push({ num: "", title: rawTitle, body });
    }
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a single parsed line as a PDF element. */
function BodyLine({ line }: { line: ParsedLine }) {
  if (line.type === "divider") {
    return <View style={s.sectionDivider} />;
  }

  if (line.type === "classification") {
    const isRed = /prohibited/i.test(line.text);
    const isOrange = /high.risk/i.test(line.text);
    const isAmber = /limited/i.test(line.text);
    const isBlue = /gpai|general.purpose/i.test(line.text);
    const isGreen = /minimal/i.test(line.text);
    const color = isRed
      ? COLOR.red
      : isOrange
        ? COLOR.orange
        : isAmber
          ? COLOR.amber
          : isBlue
            ? COLOR.blue
            : isGreen
              ? COLOR.green
              : COLOR.navy;
    return <Text style={[s.classificationLine, { color }]}>{line.text}</Text>;
  }

  if (line.type === "bullet") {
    const tier = detectTier(line.text);
    const tierStyle =
      tier === "immediate"
        ? s.tierImmediate
        : tier === "premarket"
          ? s.tierPreMarket
          : tier === "ongoing"
            ? s.tierOngoing
            : null;

    return (
      <View style={s.bulletRow}>
        <Text style={s.bulletDot}>•</Text>
        <Text style={[s.bulletText, tierStyle ?? {}]}>{line.text}</Text>
      </View>
    );
  }

  // paragraph
  return <Text style={s.paragraph}>{line.text}</Text>;
}

/** Renders one analysis section. */
function Section({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  const lines = parseBody(body);
  return (
    <View style={s.sectionWrapper}>
      {/* Keep the heading + divider together — prevent orphaned title at bottom of page */}
      <View style={s.sectionHeader} wrap={false}>
        {num !== "" && <Text style={s.sectionNumber}>{num}</Text>}
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.sectionDivider} />
      {lines.map((line, i) => (
        <BodyLine key={i} line={line} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main document
// ---------------------------------------------------------------------------

export function ComplianceReportPdf({
  systemDescription,
  analysisMarkdown,
  citedArticles,
  riskLevel,
  generatedAt,
}: PdfProps) {
  const sections = parseMarkdownSections(analysisMarkdown);
  const riskColor = riskLevel
    ? (RISK_COLOR[riskLevel] ?? COLOR.navy)
    : COLOR.navy;
  const riskLabel = riskLevel
    ? (RISK_LABEL[riskLevel] ?? riskLevel.toUpperCase())
    : "UNDETERMINED";

  const dateStr = new Date(generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title="EU AI Act Compliance Report"
      author="EU AI Act Compliance Tool"
      subject="AI System Compliance Analysis"
      creator="EU AI Act Compliance Platform"
    >
      <Page size="A4" style={s.page}>
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <View style={s.headerRow} fixed>
          <View style={s.headerLeft}>
            <Text style={s.headerLabel}>Compliance Analysis Report</Text>
            <Text style={s.headerTitle}>EU AI Act{"\n"}Compliance Report</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{dateStr}</Text>
            <Text style={s.headerConfidential}>Confidential</Text>
          </View>
        </View>

        {/* ── Risk Classification ─────────────────────────────────────── */}
        <View
          style={[
            s.riskBadgeWrapper,
            {
              backgroundColor: riskColor + "14",
              borderLeftWidth: 3,
              borderLeftColor: riskColor,
            },
          ]}
        >
          <View style={[s.riskBadgeDot, { backgroundColor: riskColor }]} />
          <View>
            <Text style={[s.riskBadgeLabel, { color: riskColor }]}>
              Risk Classification
            </Text>
            <Text style={[s.riskBadgeTitle, { color: riskColor }]}>
              {riskLabel}
            </Text>
          </View>
        </View>

        {/* ── System Description ──────────────────────────────────────── */}
        <View style={s.descBox}>
          <Text style={s.descBoxLabel}>AI System Description</Text>
          <Text style={s.descBoxText}>{systemDescription}</Text>
        </View>

        {/* ── Cited Articles ──────────────────────────────────────────── */}
        {citedArticles.length > 0 && (
          <View style={s.articlesWrapper}>
            <Text style={s.articlesLabel}>
              Articles Cited ({citedArticles.length})
            </Text>
            <View style={s.articlesRow}>
              {citedArticles.map((a) => (
                <Text key={a} style={s.articlePill}>
                  Art. {a}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Analysis Sections ───────────────────────────────────────── */}
        {sections.map((sec, i) => (
          <Section key={i} num={sec.num} title={sec.title} body={sec.body} />
        ))}

        {/* ── Footer (fixed on every page) ────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <Text style={s.footerLogo}>EU AI ACT COMPLIANCE PLATFORM</Text>
            <Text style={s.footerDisclaimer}>
              This report is informational only and does not constitute legal
              advice. Engage qualified legal counsel for formal compliance
              decisions. Based on Regulation (EU) 2024/1689 (EU AI Act).
            </Text>
          </View>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Structured PDF (v2) — typed-data report
// ---------------------------------------------------------------------------

export interface StructuredPdfProps {
  systemDescription: string;
  result: StoredStructuredResult;
  citedArticles: string[];
  generatedAt: string;
}

const ROLE_COLOR: Record<string, string> = {
  provider: COLOR.primary,
  deployer: "#7c3aed",
  importer: COLOR.amber,
  distributor: COLOR.green,
};

const TIER_COLOR_MAP: Record<string, string> = {
  IMMEDIATE: COLOR.red,
  PRE_MARKET: COLOR.amber,
  ONGOING: COLOR.green,
};

export function StructuredComplianceReportPdf({
  systemDescription,
  result,
  citedArticles,
  generatedAt,
}: StructuredPdfProps) {
  const riskColor = RISK_COLOR[result.riskLevel] ?? COLOR.navy;
  const riskLabel =
    RISK_LABELS[result.riskLevel as keyof typeof RISK_LABELS] ??
    result.riskLevel.toUpperCase();
  const roleLabel =
    ROLE_LABELS[result.operatorRole as keyof typeof ROLE_LABELS] ??
    result.operatorRole;
  const roleColor = ROLE_COLOR[result.operatorRole] ?? COLOR.navy;

  const dateStr = new Date(generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Prose sections: [sectionNumber, title, content]
  const proseSections: [string, string, string][] = [
    ["1", "Scope Assessment", result.scopeAssessment],
    ["2", "Risk Classification Analysis", result.riskClassificationAnalysis],
    ["3", "Operator Role Analysis", result.operatorRoleAnalysis],
    ["4", "Applicable Obligations", result.applicableObligations],
    ["5", "Penalty Exposure", result.penaltyExposure],
  ];

  return (
    <Document
      title="EU AI Act Compliance Report"
      author="EU AI Act Compliance Tool"
      subject="AI System Compliance Analysis"
      creator="EU AI Act Compliance Platform"
    >
      <Page size="A4" style={s.page}>
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <View style={s.headerRow} fixed>
          <View style={s.headerLeft}>
            <Text style={s.headerLabel}>Compliance Analysis Report</Text>
            <Text style={s.headerTitle}>EU AI Act{"\n"}Compliance Report</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{dateStr}</Text>
            <Text style={s.headerConfidential}>Confidential</Text>
          </View>
        </View>

        {/* ── Risk + Role badges ──────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          {/* Risk */}
          <View
            style={[
              s.riskBadgeWrapper,
              {
                flex: 1,
                backgroundColor: riskColor + "14",
                borderLeftWidth: 3,
                borderLeftColor: riskColor,
              },
            ]}
          >
            <View style={[s.riskBadgeDot, { backgroundColor: riskColor }]} />
            <View>
              <Text style={[s.riskBadgeLabel, { color: riskColor }]}>
                Risk Classification
              </Text>
              <Text style={[s.riskBadgeTitle, { color: riskColor }]}>
                {riskLabel}
              </Text>
            </View>
          </View>
          {/* Role */}
          <View
            style={[
              s.riskBadgeWrapper,
              {
                flex: 1,
                backgroundColor: roleColor + "14",
                borderLeftWidth: 3,
                borderLeftColor: roleColor,
              },
            ]}
          >
            <View style={[s.riskBadgeDot, { backgroundColor: roleColor }]} />
            <View>
              <Text style={[s.riskBadgeLabel, { color: roleColor }]}>
                Operator Role
              </Text>
              <Text style={[s.riskBadgeTitle, { color: roleColor }]}>
                {roleLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* ── System Description ──────────────────────────────────────── */}
        <View style={s.descBox}>
          <Text style={s.descBoxLabel}>AI System Description</Text>
          <Text style={s.descBoxText}>{systemDescription}</Text>
        </View>

        {/* ── GPAI Systemic Risk flag ─────────────────────────────────── */}
        {result.gpaiSystemicRisk === true && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              padding: 8,
              backgroundColor: "#fee2e2",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#fca5a5",
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontFamily: "Helvetica-Bold",
                color: "#b91c1c",
              }}
            >
              [!] SYSTEMIC RISK -- Article 55 obligations apply (training
              compute {">="}10^25 FLOPs)
            </Text>
          </View>
        )}

        {/* ── Clarifications needed ───────────────────────────────────── */}
        {result.clarificationsNeeded &&
          result.clarificationsNeeded.length > 0 && (
            <View
              style={{
                marginBottom: 12,
                padding: 8,
                backgroundColor: "#fffbeb",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#fcd34d",
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: "#92400e",
                  marginBottom: 4,
                }}
              >
                Analysis limitations — key information was missing from the
                description:
              </Text>
              {result.clarificationsNeeded.map((item, i) => (
                <Text
                  key={i}
                  style={{ fontSize: 7.5, color: "#92400e", marginBottom: 2 }}
                >
                  • {item}
                </Text>
              ))}
            </View>
          )}

        {/* ── Cited Articles ──────────────────────────────────────────── */}
        {citedArticles.length > 0 && (
          <View style={s.articlesWrapper}>
            <Text style={s.articlesLabel}>
              Articles Cited ({citedArticles.length})
            </Text>
            <View style={s.articlesRow}>
              {citedArticles.map((a) => (
                <Text key={a} style={s.articlePill}>
                  Art. {a}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ── Prose Analysis Sections ─────────────────────────────────── */}
        {proseSections.map(([num, title, content]) => (
          <Section key={num} num={num} title={title} body={content} />
        ))}

        {/* ── Key Actions ─────────────────────────────────────────────── */}
        {/* Each action uses a vertical (block) layout — react-pdf flex-row  */}
        {/* with flex:1 children collapses unreliably on long text, causing   */}
        {/* the text overlap seen in the previous layout.                     */}
        <View style={s.sectionWrapper}>
          <View style={s.sectionHeader} wrap={false}>
            <Text style={s.sectionNumber}>6</Text>
            <Text style={s.sectionTitle}>Key Actions Required</Text>
          </View>
          <View style={s.sectionDivider} />
          {result.keyActions.map((ka, i) => {
            const tierColor = TIER_COLOR_MAP[ka.tier] ?? COLOR.navy;
            const tierLabel =
              TIER_LABELS[ka.tier as keyof typeof TIER_LABELS] ?? ka.tier;
            return (
              <View
                key={i}
                wrap={false}
                style={{
                  marginBottom: 8,
                  paddingLeft: 8,
                  paddingVertical: 4,
                  paddingRight: 4,
                  borderLeftWidth: 2,
                  borderLeftColor: tierColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: "Helvetica-Bold",
                    color: tierColor,
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  {tierLabel}
                </Text>
                <Text style={s.paragraph}>{ka.action}</Text>
                {ka.deadline && (
                  <Text
                    style={[
                      s.paragraph,
                      { color: COLOR.mutedText, fontSize: 8, marginBottom: 0 },
                    ]}
                  >
                    Deadline: {ka.deadline}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        {result.timeline.length > 0 && (
          <View style={s.sectionWrapper}>
            <View style={s.sectionHeader} wrap={false}>
              <Text style={s.sectionNumber}>7</Text>
              <Text style={s.sectionTitle}>Compliance Timeline</Text>
            </View>
            <View style={s.sectionDivider} />
            {result.timeline.map((te, i) => {
              const dateColor = te.alreadyInForce ? COLOR.red : COLOR.primary;
              return (
                <View
                  key={i}
                  wrap={false}
                  style={{
                    marginBottom: 8,
                    paddingLeft: 8,
                    paddingVertical: 4,
                    paddingRight: 4,
                    borderLeftWidth: 2,
                    borderLeftColor: dateColor,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: "Helvetica-Bold",
                      color: dateColor,
                      letterSpacing: 0.3,
                      marginBottom: 2,
                    }}
                  >
                    {te.date}
                    {te.alreadyInForce ? "  [IN FORCE]" : ""}
                  </Text>
                  <Text style={s.paragraph}>{te.description}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Footer (fixed on every page) ────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <Text style={s.footerLogo}>EU AI ACT COMPLIANCE PLATFORM</Text>
            <Text style={s.footerDisclaimer}>
              This report is informational only and does not constitute legal
              advice. Engage qualified legal counsel for formal compliance
              decisions. Based on Regulation (EU) 2024/1689 (EU AI Act).
            </Text>
          </View>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
