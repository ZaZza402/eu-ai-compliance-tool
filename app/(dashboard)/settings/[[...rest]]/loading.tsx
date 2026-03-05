// Shown by Next.js while SettingsPage data-fetches (currentUser)
export default function SettingsLoading() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
      </div>

      {/* UserProfile card skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Sidebar + content layout Clerk uses */}
        <div className="flex min-h-120">
          {/* Left nav */}
          <div className="hidden w-48 shrink-0 border-r border-border p-4 sm:block">
            <div className="space-y-1">
              {[72, 56, 64, 52].map((w) => (
                <div
                  key={w}
                  className="h-8 animate-pulse rounded-md bg-muted"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Section heading */}
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            </div>

            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>

            {/* Fields */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
