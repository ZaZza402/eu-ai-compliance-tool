"use client";

/**
 * ArticleBadge
 * =============
 * A small pill that represents a cited EU AI Act article.
 *
 * If an `onArticleClick` handler is supplied (e.g. in the analysis view),
 * clicking opens the in-app ArticleDrawer instead of the external site.
 *
 * Without `onArticleClick`, it falls back to a plain link to the official
 * EUR-Lex text (e.g. in history list views where no drawer is mounted).
 */

interface Props {
  articleNum: string;
  /** When provided, clicking opens the internal drawer instead of the external link. */
  onArticleClick?: (articleNum: string) => void;
}

const EU_AI_ACT_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689";

const pillClass =
  "inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer";

export function ArticleBadge({ articleNum, onArticleClick }: Props) {
  if (onArticleClick) {
    return (
      <button
        type="button"
        onClick={() => onArticleClick(articleNum)}
        title={`View Article ${articleNum} — EU AI Act`}
        className={pillClass}
      >
        Art.&nbsp;{articleNum}
      </button>
    );
  }

  return (
    <a
      href={EU_AI_ACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={`View Article ${articleNum} in the official EU AI Act`}
      className={pillClass}
    >
      Art.&nbsp;{articleNum}
    </a>
  );
}
