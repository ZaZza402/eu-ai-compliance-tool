"use client";

import { useState } from "react";
import { ArticleDrawer } from "@/components/article/ArticleDrawer";
import { StructuredAnalysisDisplay } from "@/components/analysis/StructuredAnalysisDisplay";
import {
  isStructuredResult,
  isLegacyResult,
  type StoredStructuredResult,
} from "@/lib/analysis-schema";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

interface Props {
  result: unknown;
  articlesHit: string[];
  analysisId: string;
}

export function PublicReportViewer({ result, articlesHit, analysisId }: Props) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  if (isStructuredResult(result)) {
    return (
      <>
        <StructuredAnalysisDisplay
          result={result as StoredStructuredResult}
          analysisId={analysisId}
          onArticleClick={setSelectedArticle}
        />
        <ArticleDrawer
          articleNum={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      </>
    );
  }

  const resultText = isLegacyResult(result) ? result.text : "";
  if (!resultText) return <p className="text-muted-foreground">No analysis data.</p>;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <span className="text-sm font-medium">Full Analysis</span>
      </div>
      <div
        className="prose prose-sm dark:prose-invert max-w-none p-5"
        dangerouslySetInnerHTML={{ __html: marked.parse(resultText) as string }}
      />
    </div>
  );
}
