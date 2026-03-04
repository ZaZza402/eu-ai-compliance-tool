"use client";

/**
 * StructuredAnalysisDisplay
 * ==========================
 * Shared component that renders a completed, typed analysis result.
 * Used by both the AnalysisPage (new result) and HistoryDetailClient
 * (saved result from DB).
 *
 * All display-only — no form, no state except collapsible sections.
 */

import { useState } from "react";
import { marked } from "marked";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  ShieldAlert,
  User,
  BookOpen,
  ListChecks,
  Clock,
  Gavel,
  FileText,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { ArticleBadge } from "@/components/analysis/ArticleBadge";
import { ExportPdfButton } from "@/components/analysis/ExportPdfButton";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Article ref normalisation
// The AI returns sub-paragraph refs like "2(1)(a)". Strip everything from the
// first "(" so we get the base article number that the drawer can resolve.
// ---------------------------------------------------------------------------

function normalizeArticleRef(ref: string): string {
  const idx = ref.indexOf("(");
  return idx > 0 ? ref.slice(0, idx).trim() : ref.trim();
}

function uniqueBaseArticles(refs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    const base = normalizeArticleRef(ref);
    if (!seen.has(base)) {
      seen.add(base);
      out.push(base);
    }
  }
  return out.sort((a, b) => {
    const na = parseInt(a),
      nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    if (!isNaN(na)) return -1;
    if (!isNaN(nb)) return 1;
    return a.localeCompare(b);
  });
}
import {
  type StoredStructuredResult,
  type ActionTier,
  type RiskLevel,
  RISK_LABELS,
  RISK_COLORS,
  ROLE_LABELS,
  TIER_LABELS,
  TIER_COLORS,
} from "@/lib/analysis-schema";

marked.setOptions({ gfm: true, breaks: true });

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** The structured analysis result (v2 format). */
  result: StoredStructuredResult;
  /** The DB id — passed to ExportPdfButton and article drawer. */
  analysisId: string;
  /** Callback when an article badge is clicked to open the drawer. */
  onArticleClick?: (articleNum: string) => void;
}

// ---------------------------------------------------------------------------
// Risk badge
// ---------------------------------------------------------------------------

export function RiskBadgeCard({ level }: { level: RiskLevel }) {
  const colors = RISK_COLORS[level];
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border border-l-4 bg-card px-4 py-3 shadow-sm",
        colors.accent,
      )}
    >
      <div className={cn("h-2 w-2 shrink-0 rounded-full", colors.dot)} />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Risk Classification
        </p>
        <p className={cn("text-sm font-bold", colors.text)}>
          {RISK_LABELS[level]}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

export function RoleBadgeCard({ role }: { role: keyof typeof ROLE_LABELS }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-3">
      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Operator Role
        </p>
        <p className="text-sm font-bold capitalize text-foreground">
          {ROLE_LABELS[role]}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tier badge (inline chip)
// ---------------------------------------------------------------------------

export function TierBadge({ tier }: { tier: ActionTier }) {
  const colors = TIER_COLORS[tier];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        colors.pillBg,
        colors.pillBorder,
        colors.text,
      )}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Collapsible prose section
// ---------------------------------------------------------------------------

export function ProseSection({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">{children}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Markdown prose renderer
// ---------------------------------------------------------------------------

export function MarkdownProse({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none break-words [&_li]:text-sm [&_p]:text-sm [&_pre]:overflow-x-auto [&_strong]:font-semibold [&_table]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
    />
  );
}

// ---------------------------------------------------------------------------
// Key actions
// ---------------------------------------------------------------------------

function KeyActionsSection({
  actions,
}: {
  actions: StoredStructuredResult["keyActions"];
}) {
  const grouped = {
    IMMEDIATE: actions.filter((a) => a.tier === "IMMEDIATE"),
    PRE_MARKET: actions.filter((a) => a.tier === "PRE_MARKET"),
    ONGOING: actions.filter((a) => a.tier === "ONGOING"),
  };
  const tierDescriptions: Record<ActionTier, string> = {
    IMMEDIATE: "Already in force — act now",
    PRE_MARKET: "Before EU market placement",
    ONGOING: "Continuous lifecycle obligation",
  };

  return (
    <ProseSection icon={ListChecks} title="5. Key Actions Required">
      <div className="space-y-6">
        {(["IMMEDIATE", "PRE_MARKET", "ONGOING"] as ActionTier[]).map(
          (tier) => {
            const items = grouped[tier];
            if (!items.length) return null;
            return (
              <div key={tier}>
                <div className="mb-2.5 flex items-center gap-2">
                  <TierBadge tier={tier} />
                  <span className="text-xs text-muted-foreground">
                    {tierDescriptions[tier]}
                  </span>
                </div>
                <ol className="space-y-3">
                  {items.map((action, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <MarkdownProse content={action.action} />
                        {action.deadline && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {action.deadline}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          },
        )}
      </div>
    </ProseSection>
  );
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

function TimelineSection({
  entries,
}: {
  entries: StoredStructuredResult["timeline"];
}) {
  return (
    <ProseSection icon={Clock} title="6. Applicable Timeline">
      <ol className="space-y-3">
        {entries.map((entry, i) => (
          <li key={i} className="flex gap-3">
            <div
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                entry.alreadyInForce ? "bg-green-500" : "bg-amber-500",
              )}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {entry.date}
                {entry.alreadyInForce && (
                  <span className="ml-2 text-[10px] font-medium text-green-600 dark:text-green-400">
                    ✓ already in force
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {entry.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </ProseSection>
  );
}

// ---------------------------------------------------------------------------
// Clarifications needed banner
// ---------------------------------------------------------------------------

function ClarificationsBanner({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 dark:border-amber-500/50 dark:bg-amber-500/15">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          Analysis limitations — key information was missing
        </p>
      </div>
      <ul className="space-y-1 pl-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs text-amber-700 dark:text-amber-400"
          >
            <span className="shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
        Re-run the analysis with a more detailed description for a more accurate
        result.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export — the full structured result display
// ---------------------------------------------------------------------------

export function StructuredAnalysisDisplay({
  result,
  analysisId,
  onArticleClick,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Clarifications banner — shown when the description was too vague */}
      {result.clarificationsNeeded &&
        result.clarificationsNeeded.length > 0 && (
          <ClarificationsBanner items={result.clarificationsNeeded} />
        )}

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <RiskBadgeCard level={result.riskLevel} />
        <RoleBadgeCard role={result.operatorRole} />
        {result.gpaiSystemicRisk === true && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-700 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-400">
            ⚠ Systemic Risk (Art. 55)
          </span>
        )}
        <div className="ml-auto">
          <ExportPdfButton analysisId={analysisId} />
        </div>
      </div>

      {/* Articles cited — deduplicated to base article numbers only */}
      {result.articlesReferenced.length > 0 &&
        (() => {
          const bases = uniqueBaseArticles(result.articlesReferenced);
          const visible = bases.slice(0, 14);
          const overflow = bases.length - visible.length;
          return (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <span className="mr-1 text-xs font-medium text-muted-foreground">
                Articles cited:
              </span>
              {visible.map((a) => (
                <ArticleBadge
                  key={a}
                  articleNum={a}
                  onArticleClick={onArticleClick}
                />
              ))}
              {overflow > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{overflow} more
                </span>
              )}
            </div>
          );
        })()}

      {/* Section 1 — Scope */}
      <ProseSection icon={FileText} title="1. Scope Assessment">
        <MarkdownProse content={result.scopeAssessment} />
      </ProseSection>

      {/* Section 2 — Risk Classification */}
      <ProseSection icon={ShieldAlert} title="2. Risk Classification">
        <div className="mb-4">
          <RiskBadgeCard level={result.riskLevel} />
        </div>
        <MarkdownProse content={result.riskClassificationAnalysis} />
      </ProseSection>

      {/* Section 3 — Operator Role */}
      <ProseSection icon={User} title="3. Operator Role">
        <div className="mb-4">
          <RoleBadgeCard role={result.operatorRole} />
        </div>
        <MarkdownProse content={result.operatorRoleAnalysis} />
      </ProseSection>

      {/* Section 4 — Obligations */}
      <ProseSection icon={BookOpen} title="4. Applicable Obligations">
        <MarkdownProse content={result.applicableObligations} />
      </ProseSection>

      {/* Section 5 — Key Actions */}
      <KeyActionsSection actions={result.keyActions} />

      {/* Section 6 — Timeline */}
      <TimelineSection entries={result.timeline} />

      {/* Section 7 — Penalty Exposure */}
      <ProseSection icon={Gavel} title="7. Penalty Exposure">
        <MarkdownProse content={result.penaltyExposure} />
      </ProseSection>

      {/* Section 8 — Plain Language Summary */}
      {result.plainLanguageSummary && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                8. What This Means For You — Plain Language Summary
              </span>
            </div>
          </div>
          <div className="border-t border-emerald-500/20 px-5 pb-5 pt-4">
            <p className="mb-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              A plain English explanation of the analysis above — no legal
              terminology.
            </p>
            <MarkdownProse content={result.plainLanguageSummary} />
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{result.disclaimer}</span>
      </div>

      {/* Regulation basis + article count + report link */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Based on{" "}
            <a
              href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Regulation (EU) 2024/1689
            </a>{" "}
            · OJ 12 July 2024
          </span>
          {result.articlesReferenced.length > 0 && (
            <span>
              {result.articlesReferenced.length} article
              {result.articlesReferenced.length !== 1 ? "s" : ""} consulted
            </span>
          )}
        </div>
        <a href="/feedback" className="hover:text-foreground hover:underline">
          Found an inaccuracy? Report it →
        </a>
      </div>
    </div>
  );
}
