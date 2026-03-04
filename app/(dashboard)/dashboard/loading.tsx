// Shown by Next.js Suspense while DashboardPage data-fetches
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Recent analyses */}
      <div className="space-y-4">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
