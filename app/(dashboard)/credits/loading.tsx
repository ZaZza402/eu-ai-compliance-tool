// Shown by Next.js Suspense while CreditsPage data-fetches
export default function CreditsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Balance card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-12 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-36 animate-pulse rounded bg-muted" />
      </div>

      {/* Pack cards */}
      <div className="space-y-3">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
              <div className="mt-4 h-11 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Usage history skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <div className="flex gap-8">
              {["Event", "Credits", "Date"].map((h) => (
                <div
                  key={h}
                  className="h-3 w-16 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex gap-8 border-b border-border px-4 py-3 last:border-0"
            >
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-8 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
