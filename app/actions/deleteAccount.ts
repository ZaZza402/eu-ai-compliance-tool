"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * deleteAccount
 * =============
 * Deletes the current user's account:
 *  1. Deletes all DB records via Prisma cascade (analyses, transactions, credit events).
 *  2. Deletes the Clerk identity so they are fully signed out and removed.
 *
 * Redirects to / on success. Throws on failure so the caller can catch and display an error.
 */
export async function deleteAccount(): Promise<{ error: string } | never> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated." };

  try {
    // 1. Delete DB user — cascade removes analyses, transactions, credit_events
    await db.user.delete({ where: { id: userId } });
  } catch {
    // If user doesn't exist in DB that's fine — proceed to Clerk deletion
  }

  try {
    // 2. Delete Clerk identity
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    return {
      error: "Failed to delete account. Please contact support@caustic.app.",
    };
  }

  // Redirect after full sign-out — Clerk session is now invalid
  redirect("/");
}
