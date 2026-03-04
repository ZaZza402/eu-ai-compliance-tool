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

Given an AI system description (which may be in ANY language), output ONLY a comma-separated list of EXACTLY 8 to 14 English technical and legal terms drawn from EU AI Act vocabulary.

Cover ALL of the following angles — you must produce a term for each angle that applies:
1. Deployment sector (e.g. "banking", "healthcare", "retail", "employment", "public administration")
2. System function (e.g. "recommendation system", "chatbot", "content moderation", "scoring system", "classification")
3. Interaction type (e.g. "natural person interaction", "automated decision-making", "human oversight", "deployer use")
4. Data types processed (e.g. "personal data", "biometric data", "behavioural data", "financial data")
5. Risk signals (e.g. "Article 50 transparency", "limited risk", "minimal risk", "high-risk AI", "prohibited practice")
6. Affected persons (e.g. "consumer", "employee", "citizen", "natural person", "vulnerable group")
7. Any Annex III or Article 5 signals where applicable

Rules:
- Output ONLY the comma-separated terms. No explanation, no labels, no punctuation other than commas.
- ALWAYS produce between 8 and 14 terms — never fewer than 8.
- ALWAYS output in English regardless of the input language.
- You MUST produce terms even for simple, low-risk systems — describe what it does and who it affects.

Concrete examples of the required output format:

Input: "Chatbot on our bank website that answers customer FAQ questions — customers don't know they're talking to AI"
Output: banking, financial services, conversational AI, chatbot, natural person interaction, Article 50 transparency, limited risk, deployer obligations, consumer-facing AI, automated responses, disclosure obligation, AI system

Input: "We score job applicants 0-100 and exclude those below 60 from interview"
Output: employment, recruitment, CV screening, automated scoring, Annex III point 4, high-risk AI, Article 9 risk management, Article 10 data governance, Article 13 instructions for use, bias monitoring, candidate assessment, hiring decision, Article 6 classification

Input: "Simple product recommendation widget on our e-commerce site"
Output: e-commerce, retail, recommendation system, collaborative filtering, purchase history, consumer-facing, minimal risk, personalisation, non-binding suggestion, natural person interaction, Article 3 definitions, Article 2 scope`;

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
