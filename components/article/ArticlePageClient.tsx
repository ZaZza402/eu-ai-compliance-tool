"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Printer } from "lucide-react";

interface Props {
  /** Plain text content of the article (used for copy) */
  fullText: string;
  /** E.g. "Article 6" or "Annex III" */
  articleLabel: string;
  /** E.g. "Classification of AI systems as high-risk" */
  articleTitle: string;
  /** E.g. "~3 min read" */
  readingTime: string;
}

/**
 * Sticky mini-bar that appears after the user scrolls past the article header.
 * Contains: article label + title (truncated), reading time, copy button.
 */
export function ArticlePageClient({
  fullText,
  articleLabel,
  articleTitle,
  readingTime,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Show sticky bar after user scrolls past the sentinel div (placed below the header)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${articleLabel} — ${articleTitle}\n\nRegulation (EU) 2024/1689\n\n${fullText}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fail silently */
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Sentinel — placed right below the page header in the DOM */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Sticky bar */}
      <div
        className={`fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur transition-transform duration-200 print:hidden ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {/* Article identity */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              {articleLabel}
            </span>
            <span className="truncate text-sm font-medium">{articleTitle}</span>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {readingTime}
            </span>
            <button
              onClick={handleCopy}
              title="Copy article text"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handlePrint}
              title="Print article"
              className="inline-flex items-center rounded-md p-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
