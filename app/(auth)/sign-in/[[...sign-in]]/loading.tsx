export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      {/* Mirrors the Clerk <SignIn /> card dimensions */}
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-md">
        {/* Header area */}
        <div className="space-y-2 px-8 pb-4 pt-8">
          <div className="mx-auto h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Social button */}
        <div className="px-8 pb-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-8 pb-4">
          <div className="h-px flex-1 bg-border" />
          <div className="h-3 w-4 animate-pulse rounded bg-muted" />
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Fields */}
        <div className="space-y-3 px-8 pb-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Submit button */}
        <div className="px-8 pb-8">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
