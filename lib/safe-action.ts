/**
 * lib/safe-action.ts
 * ===================
 * next-safe-action v8 client configuration.
 *
 * Two clients are exported:
 *   actionClient      — unauthenticated (use for public operations)
 *   authActionClient  — requires a valid Clerk session; injects userId into ctx
 */

import { createSafeActionClient } from "next-safe-action";
import { auth } from "@clerk/nextjs/server";

// ---------------------------------------------------------------------------
// Base client
// ---------------------------------------------------------------------------

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Expose message but never the full stack in production
    console.error("[safe-action] Server error:", e);
    return e instanceof Error ? e.message : "An unexpected error occurred.";
  },
});

// ---------------------------------------------------------------------------
// Authenticated client — injects { userId } into action context
// ---------------------------------------------------------------------------

export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized — please sign in.");
  }
  return next({ ctx: { userId } });
});
