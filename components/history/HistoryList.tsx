"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { RISK_COLORS, RISK_LABELS } from "@/lib/analysis-schema";
import type { RiskLevel } from "@/lib/analysis-schema";

function isKnownRisk(lvl: string): lvl is RiskLevel {
  return lvl in RISK_COLORS;
}

interface AnalysisItem {
  id: string;
  description: string;
  riskLevel: string | null;
  roleFound: string | null;
  articlesHit: string[];
  creditsUsed: number | null;
  createdAt: Date;
}

interface Props {
  analyses: AnalysisItem[];
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Prohibited", value: "prohibited" },
  { label: "High Risk", value: "high_risk" },
  { label: "Limited", value: "limited" },
  { label: "Minimal", value: "minimal" },
  { label: "GPAI", value: "gpai" },
] as const;

export function HistoryList({ analyses }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const visible =
    filter === "all"
      ? analyses
      : analyses.filter((a) => a.riskLevel === filter);

  // Only show filter buttons for categories that actually exist in the data
  const presentRiskLevels = new Set(
    analyses.map((a) => a.riskLevel).filter(Boolean),
  );
  const activeFilters = FILTERS.filter(
    (f) => f.value === "all" || presentRiskLevels.has(f.value),
  );

  if (activeFilters.length <= 1) {
    // No point showing a filter bar with only "All"
    return <HistoryCards analyses={visible} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((f) => {
          const count =
            f.value === "all"
              ? analyses.length
              : analyses.filter((a) => a.riskLevel === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  filter === f.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No analyses in this category.
        </p>
      ) : (
        <HistoryCards analyses={visible} />
      )}
    </div>
  );
}

function HistoryCards({ analyses }: { analyses: AnalysisItem[] }) {
  return (
    <div className="space-y-3">
      {analyses.map((a) => (
        <Link
          key={a.id}
          href={`/history/${a.id}`}
          className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">
                {a.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(a.createdAt)}
                </span>
                {a.roleFound && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize">
                    {a.roleFound}
                  </span>
                )}
                {a.articlesHit.slice(0, 4).map((art) => (
                  <span
                    key={art}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
                  >
                    Art. {art}
                  </span>
                ))}
                {a.articlesHit.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{a.articlesHit.length - 4} more
                  </span>
                )}
              </div>
            </div>
            {a.riskLevel && isKnownRisk(a.riskLevel) && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  RISK_COLORS[a.riskLevel].pillBg,
                  RISK_COLORS[a.riskLevel].pillBorder,
                  RISK_COLORS[a.riskLevel].text,
                )}
              >
                {RISK_LABELS[a.riskLevel]}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
