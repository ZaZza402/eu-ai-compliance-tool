"use client";

/**
 * ArticleDrawer
 * ==============
 * A slide-over panel (from the right) that presents the full text of a
 * single EU AI Act article, fetched from /api/article/:id.
 *
 * Renders a professional reading view: chapter label, article title,
 * and each paragraph with its official reference ID.
 *
 * Usage:
 *   <ArticleDrawer articleNum="9" onClose={() => setOpen(null)} />
 *   <ArticleDrawer articleNum={null} onClose={() => {}} />  ← closed
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { X, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArticleContent {
  article_number: string;
  title: string;
  chapter: string;
  paragraphs: Array<{ id: string; text: string }>;
  full_text: string;
  source_file: string;
  error?: string;
}

interface Props {
  /** Article number to display, or null when drawer is closed. */
  articleNum: string | null;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArticleDrawer({ articleNum, onClose }: Props) {
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOpen = articleNum !== null;

  // Fetch article data whenever articleNum changes
  useEffect(() => {
    if (!articleNum) {
      setArticle(null);
      setFetchError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setArticle(null);

    fetch(`/api/article/${encodeURIComponent(articleNum)}`)
      .then((res) => res.json())
      .then((data: ArticleContent) => {
        if (cancelled) return;
        if (data.error) {
          setFetchError(data.error);
        } else {
          setArticle(data);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError("Failed to load article content.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Reset scroll position when switching articles
    scrollRef.current?.scrollTo(0, 0);

    return () => {
      cancelled = true;
    };
  }, [articleNum]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* ── Drawer panel ─────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          article ? `Article ${article.article_number}` : "Article viewer"
        }
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[540px] flex-col bg-background shadow-2xl",
          "border-l border-border",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              EU AI Act
            </span>
            {article && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {article.chapter}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close article viewer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-7 w-3/4 rounded bg-muted" />
              <div className="mt-6 space-y-3">
                {[80, 100, 90, 70, 100].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 rounded bg-muted"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {fetchError && !loading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Could not load article</p>
              <p className="mt-1 text-xs opacity-80">{fetchError}</p>
            </div>
          )}

          {/* Article content */}
          {article && !loading && (
            <div>
              {/* Article / Annex title block */}
              <div className="mb-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {/^annex/i.test(article.article_number)
                    ? article.chapter || article.article_number
                    : `Article ${article.article_number}`}
                </p>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {article.title}
                </h2>
              </div>

              {/* Paragraphs */}
              {article.paragraphs.length > 0 ? (
                <div className="space-y-5">
                  {article.paragraphs.map((para) => {
                    // Flat annex content stored as a single paragraph with id
                    // ending in ".content" — skip the §id badge for those.
                    const isAnnexContent = para.id.endsWith(".content");
                    return (
                      <div key={para.id} className="group">
                        <div
                          className={isAnnexContent ? "block" : "flex gap-3"}
                        >
                          {/* Paragraph reference badge — hidden for flat annex text */}
                          {!isAnnexContent && (
                            <div className="shrink-0 pt-0.5">
                              <span className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                §{para.id}
                              </span>
                            </div>
                          )}
                          {/* Paragraph text */}
                          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                            {para.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback to full_text if no structured paragraphs */
                <p className="text-sm leading-relaxed text-foreground/90">
                  {article.full_text}
                </p>
              )}

              {/* Footer note */}
              <div className="mt-8 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Source: Regulation (EU) 2024/1689 — EU AI Act
                  <br />
                  Official Journal of the European Union, 12 July 2024
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
