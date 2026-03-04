/**
 * lib/query-expansion.ts
 * =======================
 * Lightweight pre-processing step that runs BEFORE the keyword-based retriever.
 *
 * Problem it solves:
 *   The retriever's `suggestArticlesForDescription()` does substring keyword
 *   matching against `semantic_map.json`. This fails when:
 *   (a) The user writes in a language other than English (multilingual input), or
 *   (b) The user uses vague/non-legal terms that don't match the map's keywords
 *       (e.g. "loan approval bot" instead of "creditworthiness assessment system").
 *
 * Solution:
 *   Make one fast, cheap Gemini call to convert the user's description into
 *   a set of EU AI Act legal/technical terms in English.
 *   These expanded terms are then APPENDED to the original description before
 *   the keyword search runs — so the original wording is preserved for the
 *   main analysis while retrieval gets the benefit of normalized terminology.
 *
 * Multilingual support:
 *   Because the expansion prompt instructs the model to output in English
 *   regardless of input language, a French/German/Spanish/etc. description
 *   will produce English terms that match the semantic map keywords.
 *   The original description is still passed unchanged to generateStructuredAnalysis
 *   — Gemini 2.5 Flash handles multi-language input natively.
 *
 * Graceful degradation:
 *   Any error (network, quota, unexpected output) silently returns "".
 *   The retriever then runs on the original description only — no crash,
 *   just slightly fewer candidate articles.
 */

import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const EXPANSION_SYSTEM = `You are an EU AI Act legal terminology specialist.

Given an AI system description (which may be in ANY language), output ONLY a comma-separated list of 8 to 14 English technical and legal terms drawn from EU AI Act vocabulary.

Cover: deployment sector, system function, data types processed, affected persons, risk-relevant technical features, and any obvious Article 5 or Annex III signals.

Rules:
- Output ONLY the comma-separated terms. No explanation, no labels, no punctuation other than commas.
- ALWAYS output in English regardless of the input language.
- Include domain-specific legal terms (e.g. "creditworthiness assessment", "biometric identification", "remote biometric identification", "social scoring", "workplace monitoring", "GPAI model", "foundation model", "safety component", "medical device AI", "emotion recognition").
- If the description is too vague to extract meaningful terms, return your best guess based on context clues.`;

/**
 * Expand a user description into EU AI Act legal terms in English.
 * Returns a space-joined string ready to append to the retrieval query.
 * Returns "" on any error (retriever will still work, just with fewer signals).
 */
export async function expandQuery(description: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: EXPANSION_SYSTEM,
      prompt: description,
      maxOutputTokens: 150,
      temperature: 0,
    });

    // Convert "term1, term2, ..." to "term1 term2 ..." for seamless appending
    return text
      .trim()
      .split(/,\s*/)
      .map((t) => t.trim())
      .filter(Boolean)
      .join(" ");
  } catch {
    // Graceful degradation — retrieval continues without expansion
    return "";
  }
}
