import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { HistoryList } from "@/components/history/HistoryList";

export const metadata: Metadata = { title: "Analysis History" };

export default async function HistoryPage() {
  const user = await currentUser();
  if (!user) return null;

  const analyses = await db.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      description: true,
      riskLevel: true,
      roleFound: true,
      articlesHit: true,
      creditsUsed: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
        <p className="mt-1 text-muted-foreground">
          {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"}{" "}
          total
        </p>
      </div>

      {analyses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-base font-semibold">No analyses yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Run your first AI system analysis to see results here.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Run your first analysis →
          </Link>
        </div>
      ) : (
        <HistoryList analyses={analyses} />
      )}
    </div>
  );
}
