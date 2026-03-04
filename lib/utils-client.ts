/**
 * Client-safe utilities
 * ======================
 * These are the client-side equivalents of functions in lib/gemini.ts
 * (which imports 'fs' via retriever and cannot be used in Client Components).
 */

/**
 * Extract "Article N" citations from a completed AI response string.
 * Runs in the browser — no 'fs' dependency.
 */
export function extractCitedArticlesClient(text: string): string[] {
  const matches = text.match(/Article\s+(\d+)/gi) ?? [];
  const nums = matches.map((m) => m.replace(/Article\s+/i, "").trim());
  return [...new Set(nums)].sort((a, b) => Number(a) - Number(b));
}

/**
 * Parse the risk level from a completed AI response (client-safe).
 */
export function parseRiskLevelClient(
  text: string,
): "prohibited" | "high_risk" | "limited" | "gpai" | "minimal" | null {
  const lower = text.toLowerCase();
  if (lower.includes("classification: prohibited")) return "prohibited";
  if (
    lower.includes("classification: high-risk") ||
    lower.includes("classification: high_risk")
  )
    return "high_risk";
  if (
    lower.includes("classification: limited transparency") ||
    lower.includes("classification: limited")
  )
    return "limited";
  if (
    lower.includes("classification: gpai") ||
    lower.includes("classification: general-purpose")
  )
    return "gpai";
  if (
    lower.includes("classification: minimal risk") ||
    lower.includes("classification: minimal")
  )
    return "minimal";
  return null;
}
