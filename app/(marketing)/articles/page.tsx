import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { Scale } from "lucide-react";
import { ArticleSearchList } from "@/components/article/ArticleSearchList";
import { LegislationBadge } from "@/components/ui/LegislationBadge";

export const metadata: Metadata = {
  title: "EU AI Act — All 113 Articles & Annexes",
  description:
    "Browse all 113 articles of the EU AI Act (Regulation EU 2024/1689), plus 13 annexes. Free article-by-article reference for AI developers, compliance officers, and legal teams.",
  openGraph: {
    title: "EU AI Act — All 113 Articles & Annexes | Regumatrix",
    description:
      "Full text reference for Regulation EU 2024/1689. Browse by chapter or search by article number.",
  },
};

interface ArticleEntry {
  article: string;
  title: string;
  chapter: string;
  chapter_title?: string;
}

function loadItems() {
  const jsonDir = path.join(process.cwd(), "eu_ai_act_json");
  const index = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "article_index.json"), "utf-8"),
  ) as { articles: ArticleEntry[] };
  const lookup = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "article_lookup.json"), "utf-8"),
  ) as Record<string, { title: string; chapter: string; file: string }>;

  const chapterTitles = new Map<string, string>();
  for (const art of index.articles) {
    if (!chapterTitles.has(art.chapter)) {
      chapterTitles.set(art.chapter, art.chapter_title ?? art.chapter);
    }
  }

  const articleItems = index.articles.map((art) => ({
    id: art.article,
    label: `Art. ${art.article}`,
    title: art.title,
    chapter: art.chapter,
    chapter_title: chapterTitles.get(art.chapter) ?? art.chapter,
    isAnnex: false,
  }));

  const annexItems = Object.entries(lookup)
    .filter(([k]) => k.startsWith("Annex_"))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({
      id: k,
      label: k.replace("_", " "),
      title: v.title,
      chapter: v.chapter,
      chapter_title: "Annexes I \u2013 XIII",
      isAnnex: true,
    }));

  return [...articleItems, ...annexItems];
}

export default function ArticlesIndexPage() {
  const items = loadItems();
  const articleCount = items.filter((i) => !i.isAnnex).length;
  const annexCount = items.filter((i) => i.isAnnex).length;

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Scale className="h-3.5 w-3.5" />
              Regulation EU 2024/1689
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EU AI Act — Full Article Reference
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            All {articleCount} articles and {annexCount} annexes of the
            Artificial Intelligence Act. Search or browse by chapter.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{articleCount}</strong>{" "}
              articles
            </span>
            <span>·</span>
            <span>
              <strong className="text-foreground">{annexCount}</strong> annexes
            </span>
            <span>·</span>
            <span>13 chapters</span>
          </div>
          <LegislationBadge variant="inline" />
        </div>

        {/* Search + grouped list */}
        <ArticleSearchList items={items} />

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Check your AI system&apos;s obligations
          </h2>
          <p className="mb-6 text-muted-foreground">
            Don&apos;t just read the articles — find out exactly which ones
            apply to your specific AI system, your role, and your deployment
            context.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get 3 free analyses — no credit card required →
          </Link>
        </div>
      </div>
    </div>
  );
}
