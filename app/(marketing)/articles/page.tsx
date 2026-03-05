import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { BookOpen, Scale } from "lucide-react";

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

interface AnnexEntry {
  id: string;
  title: string;
  chapter: string;
}

function loadData() {
  const jsonDir = path.join(process.cwd(), "eu_ai_act_json");
  const indexRaw = fs.readFileSync(path.join(jsonDir, "article_index.json"), "utf-8");
  const lookupRaw = fs.readFileSync(path.join(jsonDir, "article_lookup.json"), "utf-8");
  const index = JSON.parse(indexRaw) as { articles: ArticleEntry[] };
  const lookup = JSON.parse(lookupRaw) as Record<string, { title: string; chapter: string; file: string }>;

  // Group articles by chapter
  const groups = new Map<string, { chapter_title: string; articles: ArticleEntry[] }>();
  for (const art of index.articles) {
    const key = art.chapter;
    if (!groups.has(key)) {
      groups.set(key, { chapter_title: art.chapter_title ?? art.chapter, articles: [] });
    }
    groups.get(key)!.articles.push(art);
  }

  // Extract annexes from lookup
  const annexes: AnnexEntry[] = Object.entries(lookup)
    .filter(([k]) => k.startsWith("Annex_"))
    .map(([k, v]) => ({ id: k, title: v.title, chapter: v.chapter }))
    .sort((a, b) => a.chapter.localeCompare(b.chapter));

  return { groups, annexes };
}

export default function ArticlesIndexPage() {
  const { groups, annexes } = loadData();

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
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
            All 113 articles and 13 annexes of the Artificial Intelligence Act.
            Click any article to read the full text and check your compliance obligations.
          </p>
        </div>

        {/* Article groups by chapter */}
        <div className="space-y-10">
          {Array.from(groups.entries()).map(([chapter, { chapter_title, articles }]) => (
            <section key={chapter}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {chapter}
                </h2>
                <span className="text-xs text-muted-foreground">{chapter_title}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {articles.map((art) => (
                  <Link
                    key={art.article}
                    href={`/articles/${art.article}`}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
                      Art. {art.article}
                    </span>
                    <span className="text-sm leading-snug">{art.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Annexes */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Annexes
              </h2>
              <span className="text-xs text-muted-foreground">I – XIII</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {annexes.map((ann) => (
                <Link
                  key={ann.id}
                  href={`/articles/${ann.id}`}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                    <BookOpen className="inline h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-muted-foreground">
                      {ann.chapter}
                    </div>
                    <div className="text-sm leading-snug">{ann.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Check your AI system&apos;s obligations</h2>
          <p className="mb-6 text-muted-foreground">
            Don&apos;t just read the articles — find out exactly which ones apply to your
            specific AI system, your role, and your deployment context.
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
