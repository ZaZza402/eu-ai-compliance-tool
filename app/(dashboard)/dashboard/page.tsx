import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { RISK_COLORS, RISK_LABELS } from "@/lib/analysis-schema";
import type { RiskLevel } from "@/lib/analysis-schema";

export const metadata: Metadata = { title: "Dashboard" };

const RISK_DIST_CONFIG = [
  {
    key: "prohibited" as RiskLevel,
    label: "Prohibited",
    bar: "bg-red-500",
  },
  {
    key: "high_risk" as RiskLevel,
    label: "High risk",
    bar: "bg-orange-500",
  },
  {
    key: "limited" as RiskLevel,
    label: "Limited",
    bar: "bg-amber-500",
  },
  {
    key: "minimal" as RiskLevel,
    label: "Minimal",
    bar: "bg-green-500",
  },
  {
    key: "gpai" as RiskLevel,
    label: "GPAI",
    bar: "bg-blue-500",
  },
];

function isKnownRisk(lvl: string | null): lvl is RiskLevel {
  return lvl !== null && lvl in RISK_COLORS;
}

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      credits: true,
      _count: { select: { analyses: true } },
    },
  });

  const credits = dbUser?.credits ?? 3;
  const totalAnalyses = dbUser?._count.analyses ?? 0;

  // Risk distribution across all this user's analyses
  const riskGroups = await db.analysis.groupBy({
    by: ["riskLevel"],
    where: { userId: user.id, riskLevel: { not: null } },
    _count: { _all: true },
  });

  const riskMap = Object.fromEntries(
    riskGroups.map((g: (typeof riskGroups)[number]) => [
      g.riskLevel,
      g._count._all,
    ]),
  );

  // Fetch the 5 most recent analyses
  const recentAnalyses = await db.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      description: true,
      riskLevel: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {totalAnalyses === 0
            ? `Welcome${user.firstName ? `, ${user.firstName}` : ""}`
            : `Welcome back${user.firstName ? `, ${user.firstName}` : ""}`}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalAnalyses === 0
            ? "Your EU AI Act compliance workspace is ready."
            : "Your EU AI Act compliance overview."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Credits */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Credits remaining</p>
          <p className="mt-1 text-3xl font-bold">{credits}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            1 credit per analysis
          </p>
        </div>

        {/* Total analyses */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total analyses</p>
          <p className="mt-1 text-3xl font-bold">{totalAnalyses}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">all time</p>
        </div>

        {/* Risk distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Risk distribution</p>
          {totalAnalyses === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Run your first analysis to see your risk profile.
            </p>
          ) : (
            <>
              {/* Stacked bar */}
              <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                {RISK_DIST_CONFIG.map(({ key, bar }) => {
                  const count = riskMap[key] ?? 0;
                  if (count === 0) return null;
                  const pct = Math.max(4, (count / totalAnalyses) * 100);
                  return (
                    <div
                      key={key}
                      className={`${bar} transition-all`}
                      style={{ width: `${pct}%` }}
                      title={`${key}: ${count}`}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {RISK_DIST_CONFIG.map(({ key, label }) => {
                  const count = riskMap[key] ?? 0;
                  if (count === 0) return null;
                  return (
                    <span
                      key={key}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        RISK_COLORS[key].pillBg,
                        RISK_COLORS[key].pillBorder,
                        RISK_COLORS[key].text,
                      )}
                    >
                      {label} {count}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/analyze"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + New analysis
        </Link>
        <Link
          href="/credits"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Buy credits
        </Link>
      </div>

      {/* Recent analyses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent analyses</h2>
          {totalAnalyses > 5 && (
            <Link
              href="/history"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          )}
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-4 text-4xl">⚖️</div>
              <h3 className="text-base font-semibold">
                Run your first compliance check
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe your AI system and get an instant, article-grounded
                analysis — risk classification, applicable obligations, key
                actions, and penalty exposure, all cited to the actual
                regulation.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/analyze"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start your first analysis →
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                You have{" "}
                <span className="font-semibold text-foreground">
                  {credits} free credit{credits !== 1 ? "s" : ""}
                </span>{" "}
                — no payment needed.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {recentAnalyses.map((a: (typeof recentAnalyses)[number]) => (
              <Link
                key={a.id}
                href={`/history/${a.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.description.slice(0, 80)}
                    {a.description.length > 80 ? "…" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {(() => {
                  const risk =
                    a.riskLevel && isKnownRisk(a.riskLevel)
                      ? a.riskLevel
                      : null;
                  return risk ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        RISK_COLORS[risk].pillBg,
                        RISK_COLORS[risk].pillBorder,
                        RISK_COLORS[risk].text,
                      )}
                    >
                      {RISK_LABELS[risk]}
                    </span>
                  ) : null;
                })()}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
