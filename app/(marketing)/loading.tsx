// Shared skeleton for all marketing pages.
// Mirrors the sticky nav height + a neutral content shimmer.
// Shows on slow connections / cold starts / dynamic pages (e.g. /articles/[id]).
export default function MarketingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav skeleton — matches the real sticky header height & layout */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />

          {/* Nav links — hidden on mobile, matches md:flex */}
          <div className="hidden items-center gap-6 md:flex">
            {[56, 72, 44, 36, 52, 48].map((w) => (
              <div
                key={w}
                className="h-3.5 animate-pulse rounded bg-muted"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>

      {/* Page content shimmer */}
      <main className="flex-1">
        {/* Hero-height block */}
        <div className="border-b border-border/40 px-4 pb-20 pt-24">
          <div className="container mx-auto flex max-w-3xl flex-col items-center gap-5">
            <div className="h-5 w-52 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-6 w-3/5 animate-pulse rounded bg-muted" />
            <div className="mt-2 flex gap-3">
              <div className="h-11 w-44 animate-pulse rounded-lg bg-muted" />
              <div className="h-11 w-32 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>

        {/* Section block */}
        <div className="px-4 py-20">
          <div className="container mx-auto grid max-w-7xl gap-6 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3"
              >
                <div className="h-7 w-8 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-5/6 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
