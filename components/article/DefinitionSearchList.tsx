"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Definition {
  num: string;
  body: string;
}

interface Props {
  preamble: string;
  definitions: Definition[];
}

export function DefinitionSearchList({ preamble, definitions }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return definitions;
    return definitions.filter(
      (d) => d.body.toLowerCase().includes(q) || d.num.includes(q),
    );
  }, [query, definitions]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-foreground/90">{preamble}</p>

      {/* Search bar — only useful for Article 3's 65 definitions */}
      {definitions.length >= 10 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${definitions.length} definitions…`}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {query && (
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "No definitions match."
            : `${filtered.length} of ${definitions.length} definitions`}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <div
            key={entry.num || i}
            className={cn(
              "flex gap-3 rounded-lg px-3 py-2.5",
              entry.body ? "bg-muted/40" : "border border-dashed border-border",
            )}
          >
            {entry.num && (
              <span className="mt-0.5 shrink-0 self-start rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                ({entry.num})
              </span>
            )}
            {entry.body ? (
              <p className="text-sm leading-relaxed text-foreground/90">
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
