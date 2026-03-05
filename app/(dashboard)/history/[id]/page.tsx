import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";
import {
  type RiskLevel,
  RISK_COLORS,
  RISK_LABELS,
} from "@/lib/analysis-schema";
import { HistoryDetailClient } from "@/components/history/HistoryDetailClient";
import { RerunButton } from "@/components/history/RerunButton";
import { ShareButton } from "@/components/history/ShareButton";
import Link from "next/link";

export const metadata: Metadata = { title: "Analysis Detail" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) return null;

  const analysis = await db.analysis.findUnique({
    where: { id, userId: user.id }, // userId guard: users can only see their own
    select: {
      id: true,
      description: true,
      result: true,
      articlesHit: true,
      riskLevel: true,
      roleFound: true,
      createdAt: true,
      creditsUsed: true,
      shareToken: true,
    },
  });

  if (!analysis) notFound();

  const knownRisk =
    analysis.riskLevel && analysis.riskLevel in RISK_COLORS
      ? (analysis.riskLevel as RiskLevel)
      : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to history
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analysis Detail</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RerunButton description={analysis.description} />
          <ShareButton
            analysisId={analysis.id}
            initialShareUrl={
              analysis.shareToken
                ? `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://regumatrix.eu"}/report/${analysis.shareToken}`
                : undefined
            }
          />
          {knownRisk && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
                RISK_COLORS[knownRisk].pillBg,
                RISK_COLORS[knownRisk].pillBorder,
                RISK_COLORS[knownRisk].text,
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  RISK_COLORS[knownRisk].dot,
                )}
              />
              {RISK_LABELS[knownRisk]}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          System Description
        </p>
        <p className="text-sm leading-relaxed">{analysis.description}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {analysis.roleFound && (
          <div>
            <span className="font-medium text-foreground">Operator role:</span>{" "}
            <span className="capitalize">{analysis.roleFound}</span>
          </div>
        )}
        <div>
          <span className="font-medium text-foreground">Credits used:</span>{" "}
          {analysis.creditsUsed}
        </div>
      </div>

      {/* Articles + rendered analysis + PDF export — all interactive, handled client-side */}
      <HistoryDetailClient
        result={analysis.result}
        articlesHit={analysis.articlesHit}
        description={analysis.description}
        id={analysis.id}
      />
    </div>
  );
}
