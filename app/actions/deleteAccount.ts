"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * deleteAccount
 * =============
 * Deletes the current user's account:
 *  1. Deletes all DB records via Prisma cascade.
 *  2. Deletes the Clerk identity.
 *
 * Returns { success: true } so the client can call signOut() to fully
 * clear the session before redirecting. (Server-side redirect after Clerk
 * deletion leaves the client JWT cached, causing a dashboard crash.)
 */
export async function deleteAccount(): Promise<{ error: string } | { success: true }> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated." };

  try {
    await db.user.delete({ where: { id: userId } });
  } catch {
    // User doesn't exist in DB — proceed to Clerk deletion
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    return { error: "Failed to delete account. Please contact support." };
  }

  return { success: true };
}
