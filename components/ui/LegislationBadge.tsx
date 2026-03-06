import {
  getLegislationStatus,
  formatLegislationDate,
} from "@/lib/legislation-status";

/**
 * Compact inline badge showing corpus freshness.
 * Server component — reads legislation-status.json at render time.
 *
 * @param variant
 *   "pill"   — bordered pill, e.g. for trust-stats rows (default)
 *   "inline" — plain text row, e.g. for article-index header
 *   "footer" — two-line layout for the marketing footer bottom bar
 */
export function LegislationBadge({
  variant = "pill",
}: {
  variant?: "pill" | "inline" | "footer";
}) {
  const status = getLegislationStatus();
  const checkedOn = formatLegislationDate(status.lastChecked);
  const updatedOn = formatLegislationDate(status.lastUpdated);

  if (variant === "footer") {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/70">
        <span className="flex items-center gap-1.5">
          {/* Pulsing green dot — corpus is checked daily */}
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Corpus checked daily · last verified {checkedOn}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span>Regulation last amended: {updatedOn}</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          Corpus verified {checkedOn}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span>Regulation last amended: {updatedOn}</span>
      </p>
    );
  }

  // Default: "pill"
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
      </span>
      Corpus verified {checkedOn}
    </span>
  );
}
