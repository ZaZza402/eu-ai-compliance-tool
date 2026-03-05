/**
 * Analysis Output Schema
 * ======================
 * Single source of truth for the structured AI output.
 *
 * Used in:
 *   • lib/gemini.ts           — as the generateObject schema
 *   • app/api/analyze/route.ts — to type the result before storing in DB
 *   • components/analysis/*   — to type the UI props
 *   • app/api/export-pdf/*    — to type the PDF generation input
 *
 * DB storage: the `Analysis.result` Json column stores this object verbatim,
 * discriminated by the presence of `_version: 2` so we can detect legacy
 * records (format v1) that stored `{ text: string }`.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Tier for key actions
// ---------------------------------------------------------------------------

export const ActionTierSchema = z.enum(["IMMEDIATE", "PRE_MARKET", "ONGOING"]);
export type ActionTier = z.infer<typeof ActionTierSchema>;

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const KeyActionSchema = z.object({
  tier: ActionTierSchema.describe(
    "IMMEDIATE = already in force, PRE_MARKET = must complete before placing on EU market, ONGOING = continuous lifecycle obligation",
  ),
  action: z
    .string()
    .describe(
      "Concrete compliance action the operator must take. Be specific — cite the article and what must be done.",
    ),
  deadline: z
    .string()
    .optional()
    .describe(
      "Specific deadline date if known, e.g. '2 August 2026'. Omit if no fixed deadline.",
    ),
});
export type KeyAction = z.infer<typeof KeyActionSchema>;

export const TimelineEntrySchema = z.object({
  date: z
    .string()
    .describe("Enforcement date, e.g. '2 February 2025' or '2 August 2026'"),
  description: z
    .string()
    .describe(
      "What becomes mandatory on this date for this specific system and role",
    ),
  alreadyInForce: z
    .boolean()
    .describe("Whether this date has already passed as of today"),
});
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

// ---------------------------------------------------------------------------
// Risk level — normalised lowercase values (stored in DB)
// The schema uses lowercase to match the existing DB column values.
// ---------------------------------------------------------------------------

export const RiskLevelSchema = z.enum([
  "prohibited",
  "high_risk",
  "limited",
  "gpai",
  "minimal",
]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const OperatorRoleSchema = z.enum([
  "provider",
  "deployer",
  "importer",
  "distributor",
]);
export type OperatorRole = z.infer<typeof OperatorRoleSchema>;

// ---------------------------------------------------------------------------
// Main output schema
// ---------------------------------------------------------------------------

export const AnalysisOutputSchema = z.object({
  scopeAssessment: z
    .string()
    .describe(
      "Detailed Article 2 and Article 3 scope analysis. Explain whether the system falls within scope, which definitions apply, and any territorial considerations. Write in full paragraphs.",
    ),

  riskLevel: RiskLevelSchema.describe(
    "Risk classification result: prohibited | high_risk | limited | gpai | minimal",
  ),

  riskClassificationAnalysis: z
    .string()
    .describe(
      "Detailed reasoning for the risk classification. Reference the specific Article 5 provision (if prohibited), Annex III category (if high-risk), Article 50 (if limited transparency), Articles 51-55 (if GPAI), or the basis for minimal risk. Write in full paragraphs.",
    ),

  operatorRole: OperatorRoleSchema.describe(
    "The user's most likely operator role under Article 3: provider | deployer | importer | distributor",
  ),

  operatorRoleAnalysis: z
    .string()
    .describe(
      "Reasoning for the operator role determination. Distinguish between provider and deployer obligations where relevant. If the role is ambiguous, explain both possibilities.",
    ),

  applicableObligations: z
    .string()
    .describe(
      "Comprehensive list of specific articles and their concrete requirements that apply to this system given its risk level and operator role. Be specific — cite article numbers and paragraph numbers where relevant.",
    ),

  keyActions: z
    .array(KeyActionSchema)
    .min(1)
    .describe(
      "Ordered list of compliance actions. Start with IMMEDIATE actions, then PRE_MARKET, then ONGOING. Each action must cite a specific article. For prohibited systems 1-2 IMMEDIATE actions suffice.",
    ),

  timeline: z
    .array(TimelineEntrySchema)
    .describe(
      "Summary of the specific enforcement dates that apply to this system. Include only dates relevant to this system's risk level and role.",
    ),

  penaltyExposure: z
    .string()
    .describe(
      "Article 99 penalty analysis — the applicable fine tier for this violation type (as % of annual worldwide turnover and/or fixed amount), and any mitigating/aggravating factors.",
    ),

  articlesReferenced: z
    .array(z.string())
    .describe(
      "Complete deduplicated list of all article numbers cited in this analysis, e.g. ['2', '5', '6', '9', 'Annex_III']. Include annex references. Use base article numbers only — no sub-paragraphs.",
    ),

  clarificationsNeeded: z
    .array(z.string())
    .optional()
    .describe(
      "List of specific pieces of information that were absent from the description and that materially affect the analysis outcome. Each entry should name the missing info and explain why it matters. Leave empty array (not omit) if the description is sufficiently detailed.",
    ),

  gpaiSystemicRisk: z
    .boolean()
    .optional()
    .describe(
      "True ONLY if riskLevel is 'gpai' AND there are indicators the model training compute exceeds 10^25 FLOPs (frontier/foundation models like GPT-4 class). False for all non-GPAI systems or clearly smaller GPAI models. Omit only if riskLevel is not gpai.",
    ),

  plainLanguageSummary: z
    .string()
    .optional()
    .describe(
      "Plain English explanation of the entire analysis for a non-lawyer. 3-5 short paragraphs. No article numbers, no legal jargon. Cover: (1) what the risk verdict means in practice, (2) who is responsible and in what capacity, (3) the top concrete tasks translated into plain language, (4) the timeline and worst-case consequence of non-compliance.",
    ),

  disclaimer: z
    .string()
    .describe(
      'Use exactly this text: "This analysis is informational only and does not constitute legal advice. Engage qualified legal counsel for formal compliance decisions. Based on Regulation (EU) 2024/1689 (EU AI Act)."',
    ),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

/**
 * What actually gets persisted in the DB — the model output plus a version tag.
 * The route handler adds `_version: 2` before storing so we can distinguish
 * new records from legacy v1 records that stored `{ text: string }`.
 */
export type StoredStructuredResult = AnalysisOutput & { _version: 2 };

// ---------------------------------------------------------------------------
// Legacy format (v1) — stored as { text: string } in the DB
// ---------------------------------------------------------------------------

export interface LegacyAnalysisResult {
  text: string;
}

// ---------------------------------------------------------------------------
// Union type for what comes out of Analysis.result (the DB Json column)
// ---------------------------------------------------------------------------

export type StoredAnalysisResult =
  | StoredStructuredResult
  | LegacyAnalysisResult;

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isStructuredResult(
  result: unknown,
): result is StoredStructuredResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "_version" in result &&
    (result as Record<string, unknown>)._version === 2
  );
}

export function isLegacyResult(
  result: unknown,
): result is LegacyAnalysisResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "text" in result &&
    typeof (result as Record<string, unknown>).text === "string"
  );
}

// ---------------------------------------------------------------------------
// Display helpers — human-readable labels and colours
// ---------------------------------------------------------------------------
//
// Two badge patterns used throughout the app:
//
//  1. PILL   — small inline chip (TierBadge, history list, dashboard, landing page)
//              bg-*-500/10  → opacity-based tint: adapts to any surface, light or dark
//              border-*-500/30 → semi-transparent colored ring
//              text-*-700 dark:text-*-400
//
//  2. ACCENT CARD — RiskBadgeCard (the main classification display)
//              Neutral bg-card surface + 4px colored left border (accent)
//              Used by: VS Code diagnostics, Linear, Tailwind docs, etc.
//
// To change all badges at once: update the values below.
// ---------------------------------------------------------------------------

export const RISK_LABELS: Record<RiskLevel, string> = {
  prohibited: "Prohibited",
  high_risk: "High-Risk",
  limited: "Limited Transparency",
  gpai: "General-Purpose AI",
  minimal: "Minimal Risk",
};

export const RISK_COLORS: Record<
  RiskLevel,
  // pill* → small chips everywhere | accent → left border on RiskBadgeCard | dot → indicator circle
  {
    text: string;
    pillBg: string;
    pillBorder: string;
    accent: string;
    dot: string;
  }
> = {
  prohibited: {
    text: "text-red-700 dark:text-red-400",
    pillBg: "bg-red-500/10 dark:bg-red-500/15",
    pillBorder: "border-red-500/30 dark:border-red-500/50",
    accent: "border-l-red-500",
    dot: "bg-red-500",
  },
  high_risk: {
    text: "text-orange-800 dark:text-orange-400",
    pillBg: "bg-orange-500/10 dark:bg-orange-500/15",
    pillBorder: "border-orange-500/30 dark:border-orange-500/50",
    accent: "border-l-orange-500",
    dot: "bg-orange-500",
  },
  limited: {
    text: "text-amber-800 dark:text-amber-400",
    pillBg: "bg-amber-500/10 dark:bg-amber-500/15",
    pillBorder: "border-amber-500/30 dark:border-amber-500/50",
    accent: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  gpai: {
    text: "text-blue-700 dark:text-blue-400",
    pillBg: "bg-blue-500/10 dark:bg-blue-500/15",
    pillBorder: "border-blue-500/30 dark:border-blue-500/50",
    accent: "border-l-blue-500",
    dot: "bg-blue-500",
  },
  minimal: {
    text: "text-green-700 dark:text-green-400",
    pillBg: "bg-green-500/10 dark:bg-green-500/15",
    pillBorder: "border-green-500/30 dark:border-green-500/50",
    accent: "border-l-green-500",
    dot: "bg-green-500",
  },
};

export const ROLE_LABELS: Record<OperatorRole, string> = {
  provider: "Provider",
  deployer: "Deployer",
  importer: "Importer",
  distributor: "Distributor",
};

export const TIER_LABELS: Record<ActionTier, string> = {
  IMMEDIATE: "Immediate",
  PRE_MARKET: "Pre-Market",
  ONGOING: "Ongoing",
};

export const TIER_COLORS: Record<
  ActionTier,
  { text: string; pillBg: string; pillBorder: string }
> = {
  IMMEDIATE: {
    text: "text-red-700 dark:text-red-400",
    pillBg: "bg-red-500/10 dark:bg-red-500/15",
    pillBorder: "border-red-500/30 dark:border-red-500/50",
  },
  PRE_MARKET: {
    text: "text-amber-800 dark:text-amber-400",
    pillBg: "bg-amber-500/10 dark:bg-amber-500/15",
    pillBorder: "border-amber-500/30 dark:border-amber-500/50",
  },
  ONGOING: {
    text: "text-green-700 dark:text-green-400",
    pillBg: "bg-green-500/10 dark:bg-green-500/15",
    pillBorder: "border-green-500/30 dark:border-green-500/50",
  },
};
