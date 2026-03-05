import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk Middleware
 * ================
 * Runs on every request via the Next.js edge runtime.
 *
 * Protected routes (require auth):
 *   - /dashboard and everything under it
 *   - /analyze
 *   - /history and everything under it
 *   - /credits
 *   - /settings
 *   - /api routes (except webhooks and public share API are handled inside the routes themselves)
 *
 * Everything else is PUBLIC — including:
 *   - / (home)
 *   - /articles and /articles/[id]
 *   - /compliance/*
 *   - /report/[token]
 *   - /pricing, /about, /feedback, /privacy, /terms
 *   - /sign-in, /sign-up
 *   - API webhooks
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analyze(.*)",
  "/history(.*)",
  "/credits(.*)",
  "/settings(.*)",
  "/api/analyze(.*)",
  "/api/export(.*)",
  "/api/share(.*)",
  "/api/credits(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
