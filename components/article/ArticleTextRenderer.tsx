"use client";

/**
 * ArticleTextRenderer
 * ====================
 * Renders EU AI Act article / paragraph text intelligently.
 *
 * Handles:
 * - Numbered definition lists like Article 3 (pattern: "(N)\n\nterm means text")
 * - Sub-lettered items like (a), (b)
 * - Inline page-break artifacts (ELI / OJ lines from source PDF)
 * - Orphaned number-only labels where the definition text was not captured
 */

import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
}

// Remove PDF scan artifacts
function cleanText(raw: string): string {
  return raw
    .replace(/ELI: http:\/\/data\.europa\.eu\/eli\/reg\/2024\/1689\/oj/g, "")
    .replace(/\\\fOJ L,.*?2024/g, "")
    .replace(/OJ L, \d+\.\d+\.\d+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Split a numbered definition block into entries like [(1, "term means ..."), ...]
function parseDefinitions(text: string): Array<{ num: string; body: string }> {
  // Match patterns like: (1) text, (10) text, (10) 'term' means text
  // Handles both padded and non-padded numbers
  const parts = text
    .split(/(?=^\(\d+\)\s)/m)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.map((part) => {
    const match = part.match(/^\((\d+)\)\s*([\s\S]*)/);
    if (!match) return { num: "", body: part };
    return { num: match[1], body: match[2].trim() };
  });
}

// Detect whether a paragraph is a numbered definitions list
function isDefinitionsList(text: string): boolean {
  return (
    /^\s*For the purposes of this Regulation/i.test(text) &&
    /\(\d+\)/.test(text)
  );
}

export function ArticleTextRenderer({ text, className }: Props) {
  const cleaned = cleanText(text);

  if (isDefinitionsList(cleaned)) {
    const [preamble, ...rest] = cleaned.split("\n\n");
    const remainder = rest.join("\n\n");
    const entries = parseDefinitions(remainder);

    return (
      <div className={cn("space-y-1", className)}>
        <p className="mb-4 text-sm leading-relaxed text-foreground/90">
          {preamble}
        </p>
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 rounded-lg px-3 py-2",
                entry.body
                  ? "bg-muted/40"
                  : "border border-dashed border-border bg-transparent",
              )}
            >
              {entry.num && (
                <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary self-start">
                  ({entry.num})
                </span>
              )}
              {entry.body ? (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {entry.body}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  Definition not captured in source data.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: whitespace-preserved paragraph
  return (
    <p
      className={cn(
        "whitespace-pre-line text-sm leading-relaxed text-foreground/90",
        className,
      )}
    >
      {cleaned}
    </p>
  );
}
