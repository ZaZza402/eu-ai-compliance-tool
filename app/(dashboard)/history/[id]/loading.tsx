// Shown by Next.js while AnalysisDetailPage data-fetches
export default function AnalysisDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + action buttons row */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Risk + Role badges */}
      <div className="flex flex-wrap gap-3">
        <div className="h-14 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="h-14 w-44 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Description box */}
      <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
      </div>

      {/* Articles cited pills */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-5 w-10 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>

      {/* 5 analysis section cards */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
          {/* Body */}
          <div className="space-y-2 border-t border-border px-5 pb-5 pt-4">
            <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
