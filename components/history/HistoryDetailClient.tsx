"use client";

/**
 * HistoryDetailClient
 * ====================
 * Client-side interactive layer for the analysis history detail page.
 *
 * Supports both result formats:
 *   – Structured (v2, _version: 2): rendered via StructuredAnalysisDisplay
 *   – Legacy (v1, { text: string }): rendered as markdown
 *
 * The parent Server Component fetches the data and passes it as props.
 */

import { useState } from "react";
import { marked } from "marked";
import { ArticleBadge } from "@/components/analysis/ArticleBadge";
import { ArticleDrawer } from "@/components/article/ArticleDrawer";
import { ExportPdfButton } from "@/components/analysis/ExportPdfButton";
import { StructuredAnalysisDisplay } from "@/components/analysis/StructuredAnalysisDisplay";
import {
  isStructuredResult,
  isLegacyResult,
  type StoredStructuredResult,
} from "@/lib/analysis-schema";

// Configure marked once at module level
marked.setOptions({ gfm: true, breaks: true });

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** Raw JSON value from the DB `result` column. */
  result: unknown;
  /** Article numbers cited by the analysis. */
  articlesHit: string[];
  /** Original user description (for fallback/legacy rendering). */
  description: string;
  /** Analysis DB record ID — used for ExportPdfButton and StructuredAnalysisDisplay. */
  id: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HistoryDetailClient({
  result,
  articlesHit,
  description,
  id,
}: Props) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Structured result (v2) — full typed section display
  // ------------------------------------------------------------------
  if (isStructuredResult(result)) {
    return (
      <>
        <StructuredAnalysisDisplay
          result={result as StoredStructuredResult}
          analysisId={id}
          onArticleClick={setSelectedArticle}
        />
        <ArticleDrawer
          articleNum={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      </>
    );
  }

  // ------------------------------------------------------------------
  // Legacy result (v1) — plain markdown rendering
  // ------------------------------------------------------------------
  const resultText = isLegacyResult(result) ? result.text : "";

  return (
    <>
      {/* Articles cited (with drawer support) */}
      {articlesHit.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Articles cited
          </p>
          <div className="flex flex-wrap gap-1.5">
            {articlesHit.map((art) => (
              <ArticleBadge
                key={art}
                articleNum={art}
                onArticleClick={setSelectedArticle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Full analysis — rendered markdown */}
      {resultText && (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-sm font-medium">Full Analysis</span>
            <ExportPdfButton analysisId={id} />
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2"
            dangerouslySetInnerHTML={{
              __html: marked.parse(resultText) as string,
            }}
          />
        </div>
      )}

      {/* Article slide-over drawer */}
      <ArticleDrawer
        articleNum={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}

// description is optional in legacy rendering; kept in props for future use.
