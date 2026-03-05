import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { retriever } from "@/lib/retriever";
import { ArticleTextRenderer } from "@/components/article/ArticleTextRenderer";
import { ArticlePageClient } from "@/components/article/ArticlePageClient";
import { ChevronLeft, ChevronRight, Scale } from "lucide-react";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Generate static params for all 113 articles + 13 annexes
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const jsonDir = path.join(process.cwd(), "eu_ai_act_json");
  const lookup = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "article_lookup.json"), "utf-8"),
  ) as Record<string, unknown>;

  return Object.keys(lookup).map((id) => ({ id }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = retriever.getArticle(id);

  if (article.error) {
    return { title: "Article Not Found" };
  }

  const isAnnex = /^annex/i.test(id);
  const shortTitle = isAnnex
    ? `${article.chapter} — ${article.title}`
    : `Article ${article.article_number} — ${article.title}`;

  const snippet = (article.full_text ?? "")
    .slice(0, 200)
    .replace(/\n/g, " ")
    .trim();

  return {
    title: shortTitle,
    description: `${shortTitle} — EU AI Act (Regulation EU 2024/1689). ${snippet}…`,
    openGraph: {
      title: `${shortTitle} | EU AI Act`,
      description: snippet,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = retriever.getArticle(id);

  if (article.error) notFound();

  const isAnnex = /^annex/i.test(id);
  const articleNum = Number(id);
  const prevId = !isAnnex && articleNum > 1 ? String(articleNum - 1) : null;
  const nextId = !isAnnex && articleNum < 113 ? String(articleNum + 1) : null;

  // Label shown in UI (e.g. "Article 6" or "Annex III")
  const articleLabel = isAnnex
    ? article.chapter
    : `Article ${article.article_number}`;

  // Reading time — ~200 wpm average
  const wordCount = (article.full_text ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const readingTime = `~${readingMinutes} min read`;

  // Related articles — same chapter, exclude current, up to 4
  const jsonDir = path.join(process.cwd(), "eu_ai_act_json");
  const indexData = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "article_index.json"), "utf-8"),
  ) as {
    articles: Array<{ article: string; title: string; chapter: string }>;
  };

  const related = !isAnnex
    ? indexData.articles
        .filter(
          (a) =>
            a.chapter === article.chapter &&
            a.article !== String(article.article_number),
        )
        .slice(0, 4)
    : [];

  // JSON-LD for this specific article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    name: isAnnex
      ? `EU AI Act — ${article.chapter}: ${article.title}`
      : `EU AI Act — Article ${article.article_number}: ${article.title}`,
    description: (article.full_text ?? "").slice(0, 300),
    legislationIdentifier: "EU 2024/1689",
    legislationDate: "2024-07-12",
    publisher: {
      "@type": "GovernmentOrganization",
      name: "European Union",
    },
    inLanguage: "en",
    isAccessibleForFree: true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky mini-bar + copy button (client) */}
      <ArticlePageClient
        fullText={article.full_text ?? ""}
        articleLabel={articleLabel}
        articleTitle={article.title}
        readingTime={readingTime}
      />

      <div className="py-12">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/articles" className="hover:text-foreground">
              Articles
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">
              {isAnnex ? article.chapter : `Article ${article.article_number}`}
            </span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Scale className="h-3 w-3" />
                {article.chapter}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {articleLabel}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {article.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Regulation (EU) 2024/1689 · Official Journal of the EU, 12 July
              2024 · <span className="tabular-nums">{readingTime}</span>
            </p>
          </div>

          {/* Article text */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {article.paragraphs.length > 0 ? (
              <div className="space-y-5">
                {article.paragraphs.map((para) => (
                  <ArticleTextRenderer key={para.id} text={para.text} />
                ))}
              </div>
            ) : (
              <ArticleTextRenderer text={article.full_text} />
            )}

            <div className="mt-8 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Source: Regulation (EU) 2024/1689 of the European Parliament and
                of the Council — the EU Artificial Intelligence Act.
                <br />
                Published in the Official Journal of the European Union, 12 July
                2024.
              </p>
            </div>
          </div>

          {/* Article navigation */}
          {!isAnnex && (
            <div className="mt-6 flex items-center justify-between gap-4">
              {prevId ? (
                <Link
                  href={`/articles/${prevId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Article {prevId}
                </Link>
              ) : (
                <div />
              )}
              {nextId && (
                <Link
                  href={`/articles/${nextId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Article {nextId}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                More from {article.chapter}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((rel) => (
                  <Link
                    key={rel.article}
                    href={`/articles/${rel.article}`}
                    className="group rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 hover:bg-accent"
                  >
                    <span className="block font-mono text-[11px] text-primary">
                      Article {rel.article}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium group-hover:text-primary">
                      {rel.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="mb-1 text-base font-semibold">
              Does {articleLabel} apply to your AI system?
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Regumatrix analyses your specific AI system against all 113
              articles and tells you exactly which obligations apply, your
              operator role, and the key actions you need to take — grounded in
              the actual regulation text.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Check your AI system free →
              </Link>
              <Link
                href="/articles"
                className="inline-flex h-9 items-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Browse all articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
