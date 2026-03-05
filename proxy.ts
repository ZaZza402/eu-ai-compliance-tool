import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/about(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/feedback(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Content pages — publicly accessible without login
  "/articles(.*)",
  "/compliance(.*)",
  "/report(.*)",
  // Public APIs
  "/api/webhooks(.*)",
  "/api/contact(.*)",
  "/api/share(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
