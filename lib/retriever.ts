/**
 * EU AI Act Retriever — TypeScript
 * ===================================
 * TypeScript port of retriever.py.
 * Server-only: uses the Node.js `fs` module. Never import this in Client Components.
 *
 * Usage (in API routes / Server Components):
 *   import { retriever } from "@/lib/retriever"
 *   const article = retriever.getArticle("9")
 *   const context = retriever.buildLLMContext(["5", "6", "9", "Annex_III"])
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArticleMeta {
  article: string;
  title: string;
  chapter: string;
  chapter_title?: string;
  section?: string | null;
  section_title?: string | null;
  file: string;
}

export interface ArticleContent {
  article_number: string;
  title: string;
  chapter: string;
  paragraphs: Array<{ id: string; text: string }>;
  full_text: string;
  source_file: string;
  error?: string;
}

export interface AnnexContent {
  annex_id: string;
  source_file: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface KeywordSearchResult {
  keyword_searched: string;
  matched_map_keys: string[];
  article_references: string[];
  article_details: ArticleContent[];
}

export interface SuggestionResult {
  description: string;
  candidate_articles: Record<string, string[]>;
  note: string;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const JSON_DIR = path.join(process.cwd(), "eu_ai_act_json");

// ---------------------------------------------------------------------------
// File cache (module-level, persists across requests within one Node process)
// ---------------------------------------------------------------------------

const _cache = new Map<string, unknown>();

function loadJson<T = Record<string, unknown>>(filename: string): T {
  if (_cache.has(filename)) return _cache.get(filename) as T;
  const filePath = path.join(JSON_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  _cache.set(filename, parsed);
  return parsed;
}

function getArticleLookup(): Record<
  string,
  { title: string; chapter: string; file: string }
> {
  return loadJson("article_lookup.json");
}

function getArticleIndex(): { articles: ArticleMeta[] } {
  return loadJson("article_index.json");
}

function getSemanticMapRaw(): Record<string, unknown> {
  return loadJson("semantic_map.json");
}

// ---------------------------------------------------------------------------
// Article extraction helpers
// ---------------------------------------------------------------------------

interface ChapterData {
  articles?: RawArticle[];
  sections?: Array<{ articles?: RawArticle[] }>;
}

interface RawArticle {
  article?: string;
  title?: string;
  content?: {
    paragraphs?: Array<{ id: string; text: string }>;
    full_text?: string;
  };
}

interface FlatAnnexData {
  annex?: string;
  title?: string;
  content?: string;
}

/**
 * Convert a flat annex JSON file into the ArticleContent shape expected by
 * callers of getArticle(). Accepts an optional lookup meta so the title and
 * chapter label can fall back to the pre-indexed values.
 */
function annexAsArticle(
  num: string,
  meta?: { title: string; chapter: string; file: string },
): ArticleContent {
  // Normalise the key into the filename the annex file loader expects.
  // getAnnex() handles "Annex_III", "Annex III", "annex_iii", etc.
  let cleaned = num.trim().toLowerCase().replace(/ /g, "_");
  if (!cleaned.startsWith("annex_"))
    cleaned = "annex_" + cleaned.replace(/^_/, "");
  const filename = cleaned.endsWith(".json") ? cleaned : cleaned + ".json";

  try {
    const d = loadJson<FlatAnnexData>(filename);
    const title = d.title ?? meta?.title ?? "";
    const chapter = d.annex ?? meta?.chapter ?? num;
    const content = d.content ?? "";
    return {
      article_number: num,
      title,
      chapter,
      paragraphs: content ? [{ id: `${num}.content`, text: content }] : [],
      full_text: content,
      source_file: filename,
    };
  } catch {
    return {
      article_number: num,
      title: meta?.title ?? "",
      chapter: meta?.chapter ?? "",
      paragraphs: [],
      full_text: "",
      source_file: filename,
      error: `Annex file '${filename}' not found.`,
    };
  }
}

function extractArticleFromChapter(
  articleNum: string,
  chapterData: ChapterData,
): RawArticle | null {
  const target = `Article ${articleNum}`;

  // 1. Top-level articles list
  for (const art of chapterData.articles ?? []) {
    if ((art.article ?? "").trim() === target) return art;
  }

  // 2. Section-nested articles
  for (const section of chapterData.sections ?? []) {
    for (const art of section.articles ?? []) {
      if ((art.article ?? "").trim() === target) return art;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Retriever class
// ---------------------------------------------------------------------------

class EUAIActRetriever {
  // ------------------------------------------------------------------
  // Article retrieval
  // ------------------------------------------------------------------

  getArticle(articleNum: string | number): ArticleContent {
    const lookup = getArticleLookup();
    const num = String(articleNum).trim();

    if (!(num in lookup)) {
      // Fall through to annex retrieval for "Annex_III", "Annex III", etc.
      if (/^annex/i.test(num)) {
        return annexAsArticle(num);
      }
      return {
        article_number: num,
        title: "",
        chapter: "",
        paragraphs: [],
        full_text: "",
        source_file: "",
        error: `Article ${num} not found in lookup.`,
      };
    }

    const meta = lookup[num];

    // Flat annex JSON files (annex_X.json) have a different structure —
    // they have top-level "annex", "title", and "content" fields rather
    // than the articles[] / sections[] hierarchy used by chapter files.
    if (meta.file.startsWith("annex_")) {
      return annexAsArticle(num, meta);
    }

    const chapterData = loadJson<ChapterData>(meta.file);
    const art = extractArticleFromChapter(num, chapterData);

    if (!art) {
      return {
        article_number: num,
        title: meta.title,
        chapter: meta.chapter,
        paragraphs: [],
        full_text: "",
        source_file: meta.file,
        error: `Article content not found in ${meta.file}`,
      };
    }

    const content = art.content ?? {};
    return {
      article_number: num,
      title: art.title ?? meta.title,
      chapter: meta.chapter,
      paragraphs: content.paragraphs ?? [],
      full_text: content.full_text ?? "",
      source_file: meta.file,
    };
  }

  getArticles(articleNumbers: Array<string | number>): ArticleContent[] {
    return articleNumbers.map((n) => this.getArticle(n));
  }

  getArticleSummary(articleNum: string | number): string {
    const lookup = getArticleLookup();
    const num = String(articleNum).trim();
    if (!(num in lookup)) return `Article ${num}: not found`;
    const meta = lookup[num];
    return `Article ${num} — ${meta.title} (${meta.chapter})`;
  }

  listAllArticles(): ArticleMeta[] {
    return getArticleIndex().articles.map((a) => ({
      article: a.article,
      title: a.title,
      chapter: a.chapter,
      chapter_title: a.chapter_title,
      section: a.section ?? null,
      section_title: a.section_title ?? null,
      file: a.file,
    }));
  }

  // ------------------------------------------------------------------
  // Annex retrieval
  // ------------------------------------------------------------------

  getAnnex(annexId: string): AnnexContent {
    let cleaned = annexId.trim().toLowerCase().replace(/ /g, "_");
    if (!cleaned.startsWith("annex_"))
      cleaned = "annex_" + cleaned.replace(/^_/, "");
    if (!cleaned.endsWith(".json")) cleaned += ".json";

    try {
      const data = loadJson(cleaned);
      return { annex_id: annexId, source_file: cleaned, data };
    } catch {
      return {
        annex_id: annexId,
        source_file: cleaned,
        data: {},
        error: `Annex file '${cleaned}' not found.`,
      };
    }
  }

  // ------------------------------------------------------------------
  // Semantic map navigation
  // ------------------------------------------------------------------

  getSemanticMap(): Record<string, unknown> {
    return getSemanticMapRaw();
  }

  getReasoningWorkflow(): Array<{
    step: number;
    label: string;
    question: string;
    guidance: string;
    articles: string[];
  }> {
    const map = getSemanticMapRaw() as {
      reasoning_workflow?: {
        steps?: Array<{
          step: number;
          label: string;
          question: string;
          guidance: string;
          articles: string[];
        }>;
      };
    };
    return map.reasoning_workflow?.steps ?? [];
  }

  getRiskClassificationMap(): Record<string, unknown> {
    const map = getSemanticMapRaw() as {
      risk_classification?: Record<string, unknown>;
    };
    return map.risk_classification ?? {};
  }

  getHighRiskDomains(): Array<{
    domain_id: number;
    name: string;
    description: string;
    keywords: string[];
  }> {
    const rc = this.getRiskClassificationMap() as {
      high_risk?: {
        annex_III_pathway?: {
          domains?: Array<{
            domain_id: number;
            name: string;
            description: string;
            keywords: string[];
          }>;
        };
      };
    };
    return rc.high_risk?.annex_III_pathway?.domains ?? [];
  }

  getProhibitedPractices(): Array<{
    article_ref: string;
    description: string;
  }> {
    const rc = this.getRiskClassificationMap() as {
      prohibited?: {
        practices?: Array<{ article_ref: string; description: string }>;
      };
    };
    return rc.prohibited?.practices ?? [];
  }

  getOperatorObligations(
    role: string,
  ): Record<string, unknown> | { error: string } {
    const map = getSemanticMapRaw() as {
      operator_roles?: Record<string, unknown>;
    };
    const roles = map.operator_roles ?? {};
    const roleLower = role.trim().toLowerCase();
    if (!(roleLower in roles)) {
      return {
        error: `Role '${role}' not found. Valid: ${Object.keys(roles).join(", ")}`,
      };
    }
    return roles[roleLower] as Record<string, unknown>;
  }

  getComplianceChecklist(profile: string): Array<Record<string, unknown>> {
    const map = getSemanticMapRaw() as {
      compliance_checklist_templates?: Record<
        string,
        Array<Record<string, unknown>>
      >;
    };
    const checklists = map.compliance_checklist_templates ?? {};
    const key = profile.trim().toLowerCase() + "_checklist";
    if (!(key in checklists)) {
      return [
        {
          error: `No checklist for '${profile}'. Valid: ${Object.keys(
            checklists,
          )
            .map((k) => k.replace("_checklist", ""))
            .join(", ")}`,
        },
      ];
    }
    return checklists[key];
  }

  getPenalties(): Record<string, unknown> {
    const map = getSemanticMapRaw() as { penalties?: Record<string, unknown> };
    return map.penalties ?? {};
  }

  getKeyDefinitions(): Record<string, unknown> {
    const map = getSemanticMapRaw() as {
      key_definitions?: Record<string, unknown>;
    };
    return map.key_definitions ?? {};
  }

  getAnnexesSummary(): Record<string, unknown> {
    const map = getSemanticMapRaw() as {
      annexes_summary?: Record<string, unknown>;
    };
    return map.annexes_summary ?? {};
  }

  // ------------------------------------------------------------------
  // Keyword search
  // ------------------------------------------------------------------

  searchByKeyword(keyword: string): KeywordSearchResult {
    const map = getSemanticMapRaw() as {
      keyword_to_articles?: Record<string, string[]>;
    };
    const kwMap = map.keyword_to_articles ?? {};
    const kwLower = keyword.toLowerCase();

    const matchedKeys: string[] = [];
    const allArticleRefs: string[] = [];

    for (const [key, articles] of Object.entries(kwMap)) {
      if (key === "_description") continue;
      if (
        kwLower.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(kwLower)
      ) {
        matchedKeys.push(key);
        allArticleRefs.push(...articles);
      }
    }

    // Also search high-risk domain keywords
    for (const domain of this.getHighRiskDomains()) {
      for (const kw of domain.keywords ?? []) {
        if (
          kwLower.includes(kw.toLowerCase()) ||
          kw.toLowerCase().includes(kwLower)
        ) {
          matchedKeys.push(
            `high_risk_domain:${domain.domain_id}:${domain.name}`,
          );
          allArticleRefs.push(
            `6(2)+Annex_III(${domain.domain_id})`,
            "9",
            "10",
            "13",
            "14",
          );
          break;
        }
      }
    }

    // Deduplicate while preserving order
    const seen = new Set<string>();
    const uniqueRefs: string[] = [];
    for (const ref of allArticleRefs) {
      if (!seen.has(ref)) {
        seen.add(ref);
        uniqueRefs.push(ref);
      }
    }

    // Retrieve full text only for clean numeric references
    const numericRefs = uniqueRefs.filter((r) => /^\d+$/.test(r));
    const articleDetails = this.getArticles(numericRefs);

    return {
      keyword_searched: keyword,
      matched_map_keys: matchedKeys,
      article_references: uniqueRefs,
      article_details: articleDetails,
    };
  }

  // ------------------------------------------------------------------
  // LLM context builder
  // ------------------------------------------------------------------

  buildLLMContext(
    articleNumbers: string[],
    options: {
      includeWorkflow?: boolean;
      includeRiskMap?: boolean;
      maxArticles?: number;
    } = {},
  ): string {
    const {
      includeWorkflow = true,
      includeRiskMap = false,
      maxArticles = 10,
    } = options;
    const lines: string[] = [];

    lines.push("=".repeat(70));
    lines.push("EU AI ACT (Regulation EU 2024/1689) — GROUNDING CONTEXT");
    lines.push("=".repeat(70));

    if (includeWorkflow) {
      lines.push("\n## REASONING WORKFLOW\n");
      for (const step of this.getReasoningWorkflow()) {
        lines.push(`Step ${step.step}: ${step.label}`);
        lines.push(`  Q: ${step.question}`);
        lines.push(`  Guidance: ${step.guidance}`);
        lines.push(`  Key articles: ${(step.articles ?? []).join(", ")}`);
        lines.push("");
      }
    }

    if (includeRiskMap) {
      lines.push("\n## RISK CLASSIFICATION MAP\n");
      const rm = this.getRiskClassificationMap() as Record<
        string,
        { label?: string; summary?: string }
      >;
      for (const [level, data] of Object.entries(rm)) {
        lines.push(`### ${data.label ?? level}`);
        lines.push(data.summary ?? "");
        lines.push("");
      }
    }

    lines.push("\n## ARTICLE TEXTS\n");
    const toFetch = articleNumbers.slice(0, maxArticles);

    for (const ref of toFetch) {
      const refClean = ref.trim();

      if (/^annex/i.test(refClean)) {
        const annex = this.getAnnex(refClean);
        lines.push(`### ${refClean.toUpperCase()}`);
        if (annex.data) {
          const d = annex.data as {
            title?: string;
            content?: string | Record<string, unknown>;
          };
          lines.push(d.title ?? "");
          if (typeof d.content === "string") {
            lines.push(d.content);
          } else if (d.content) {
            lines.push(JSON.stringify(d.content, null, 2));
          }
        }
        lines.push("");
      } else {
        const numMatch = refClean.match(/^(\d+)/);
        if (numMatch) {
          const art = this.getArticle(numMatch[1]);
          lines.push(`### Article ${art.article_number} — ${art.title}`);
          lines.push(`Chapter: ${art.chapter}`);
          lines.push("");
          if (art.full_text) {
            lines.push(art.full_text);
          } else {
            for (const para of art.paragraphs) {
              lines.push(`  [${para.id}] ${para.text}`);
            }
          }
          lines.push("");
        }
      }
    }

    lines.push("=".repeat(70));
    lines.push("END OF GROUNDING CONTEXT");
    lines.push("=".repeat(70));

    return lines.join("\n");
  }

  // ------------------------------------------------------------------
  // Heuristic article suggestion
  // ------------------------------------------------------------------

  suggestArticlesForDescription(description: string): SuggestionResult {
    const descLower = description.toLowerCase();
    const map = getSemanticMapRaw() as {
      keyword_to_articles?: Record<string, string[]>;
    };
    const kwMap = map.keyword_to_articles ?? {};

    const hits: Record<string, string[]> = {};

    // Keyword map
    for (const [key, articles] of Object.entries(kwMap)) {
      if (key === "_description") continue;
      const words = key.replace(/_/g, " ").split(" ");
      if (words.some((w) => w.length > 2 && descLower.includes(w))) {
        for (const a of articles) {
          if (!hits[a]) hits[a] = [];
          hits[a].push(key);
        }
      }
    }

    // High-risk domain keywords
    for (const domain of this.getHighRiskDomains()) {
      for (const kw of domain.keywords ?? []) {
        if (descLower.includes(kw.toLowerCase())) {
          const ref = `6+Annex_III_domain_${domain.domain_id}`;
          if (!hits[ref]) hits[ref] = [];
          hits[ref].push(kw);
          break;
        }
      }
    }

    // Prohibited practice keywords
    for (const practice of this.getProhibitedPractices()) {
      const words = practice.description.toLowerCase().split(" ");
      for (const word of words) {
        if (word.length > 5 && descLower.includes(word)) {
          const ref = `5 (${practice.article_ref})`;
          if (!hits[ref]) hits[ref] = [];
          hits[ref].push(word);
          break;
        }
      }
    }

    return {
      description,
      candidate_articles: hits,
      note: "These are heuristic suggestions. The LLM must reason through the full workflow to confirm applicability.",
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton export — import { retriever } in API routes / Server Components
// ---------------------------------------------------------------------------
export const retriever = new EUAIActRetriever();
