"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, X } from "lucide-react";

interface ArticleItem {
  id: string; // "1"-"113" or "Annex_I"-"Annex_XIII"
  label: string; // "Art. 3" or "Annex I"
  title: string;
  chapter: string;
  chapter_title: string;
  isAnnex: boolean;
}

interface Props {
  items: ArticleItem[];
}

function romanNumeral(id: string): string {
  // "Annex_I" → "I", "Annex_XIII" → "XIII"
  return id.replace("Annex_", "").replace(/_/g, " ");
}

export function ArticleSearchList({ items }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.chapter_title.toLowerCase().includes(q),
    );
  }, [query, items]);

  // Group into chapters (preserves original order when not searching)
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { chapter_title: string; items: ArticleItem[]; isAnnex: boolean }
    >();
    for (const item of filtered) {
      const key = item.isAnnex ? "__annexes__" : item.chapter;
      if (!map.has(key)) {
        map.set(key, {
          chapter_title: item.isAnnex ? "Annexes" : item.chapter_title,
          items: [],
          isAnnex: item.isAnnex,
        });
      }
      map.get(key)!.items.push(item);
    }
    return map;
  }, [filtered]);

  const totalShown = filtered.length;
  const isSearching = query.trim().length > 0;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, number, or chapter…"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm shadow-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {isSearching && (
        <p className="mb-4 text-sm text-muted-foreground">
          {totalShown === 0
            ? "No articles match your search."
            : `${totalShown} article${totalShown !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Article groups */}
      <div className="space-y-10">
        {[...groups.entries()].map(([chapterKey, { chapter_title, items: groupItems, isAnnex }]) => (
          <section key={chapterKey} id={chapterKey.toLowerCase().replace(/\s+/g, "-")}>
            <div className="mb-3 flex items-center gap-3 border-b border-border pb-2">
              {isAnnex ? (
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Annexes
                </h2>
              ) : (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {chapterKey}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    — {chapter_title}
                  </span>
                </>
              )}
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {groupItems.length}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {groupItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/articles/${item.id}`}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                >
                  {item.isAnnex ? (
                    <span className="mt-0.5 flex h-6 w-9 shrink-0 items-center justify-center rounded bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span className="ml-0.5">{romanNumeral(item.id)}</span>
                    </span>
                  ) : (
                    <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary group-hover:bg-primary/20">
                      {item.label}
                    </span>
                  )}
                  <span className="text-sm leading-snug text-foreground/90 group-hover:text-foreground">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
