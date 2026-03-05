// Shown by Next.js while AnalyzePage data-fetches (user upsert + credits)
export default function AnalyzeLoading() {
  return (
    <div className="space-y-6">
      {/* Header row — title + credit counter */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-1 text-right">
          <div className="h-8 w-10 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Form card */}
      <div className="space-y-4">
        {/* Label row + wizard button */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Scenario starter chips */}
        <div className="flex flex-wrap gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
          {[88, 72, 96, 112, 104, 80].map((w) => (
            <div
              key={w}
              className="h-5 animate-pulse rounded-full bg-muted"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Textarea */}
        <div className="h-44 w-full animate-pulse rounded-lg bg-muted" />

        {/* Char count + hint row */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Submit button */}
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
