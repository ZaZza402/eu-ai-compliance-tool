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
import { DefinitionSearchList } from "./DefinitionSearchList";

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

// Render a paragraph that may contain lettered sub-lists: (a) text; (b) text
// Returns segments split by lettered items
function splitLettered(
  text: string,
): Array<{ type: "text" | "letter"; label?: string; body: string }> {
  const parts = text
    .split(/(?=^\([a-z]{1,2}\)\s)/m)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return [{ type: "text", body: text }];
  return parts.map((part) => {
    const match = part.match(/^\(([a-z]{1,2})\)\s*([\s\S]*)/);
    if (!match) return { type: "text" as const, body: part };
    return { type: "letter" as const, label: match[1], body: match[2].trim() };
  });
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
        <DefinitionSearchList preamble={preamble} definitions={entries} />
      </div>
    );
  }

  // Default: whitespace-preserved paragraph — check for lettered sub-lists
  const segments = splitLettered(cleaned);

  if (segments.length > 1) {
    const [first, ...rest] = segments;
    return (
      <div className={cn("space-y-1", className)}>
        {first.type === "text" && first.body && (
          <p className="text-sm leading-relaxed text-foreground/90">
            {first.body}
          </p>
        )}
        <ul className="ml-1 mt-1 space-y-1.5">
          {rest.map((seg, i) =>
            seg.type === "letter" ? (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                  ({seg.label})
                </span>
                <span className="text-sm leading-relaxed text-foreground/90">
                  {seg.body}
                </span>
              </li>
            ) : (
              <li
                key={i}
                className="text-sm leading-relaxed text-foreground/90"
              >
                {seg.body}
              </li>
            ),
          )}
        </ul>
      </div>
    );
  }

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
