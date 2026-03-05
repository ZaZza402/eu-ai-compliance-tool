import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";

export const metadata: Metadata = { title: "New Analysis" };

export default async function AnalyzePage() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  // Resolve the user row, handling the edge case where the same email exists
  // under a different Clerk ID (e.g. dev-era test account vs production account).
  let dbUser: { id: string; credits: number; freeCreditsGranted: boolean } | null = null;
  try {
    dbUser = await db.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email, firstName: user.firstName, lastName: user.lastName, credits: 0, freeCreditsGranted: false },
      update: {},
      select: { id: true, credits: true, freeCreditsGranted: true },
    });
  } catch {
    // Unique email conflict — find whichever row owns this email
    dbUser = await db.user.findFirst({
      where: { email },
      select: { id: true, credits: true, freeCreditsGranted: true },
    });
  }

  // ── Free credit grant on first visit (with IP abuse check) ───────────────
  // Credits are granted here at page render so the user sees them immediately,
  // not deferred to the first submission (which confused users with a 0 balance).
  if (dbUser && !dbUser.freeCreditsGranted) {
    const headersList = await headers();
    const clientIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    // Count other accounts from this IP that already received free credits
    // in the last 30 days — limit free trials to 2 accounts per IP.
    const recentIpAccounts =
      clientIp !== "unknown"
        ? await db.user.count({
            where: {
              signupIp: clientIp,
              freeCreditsGranted: true,
              id: { not: dbUser.id },
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          })
        : 0;

    const creditsToGrant = recentIpAccounts < 2 ? 3 : 0;

    const updated = await db.user.update({
      where: { id: dbUser.id },
      data: {
        credits: { increment: creditsToGrant },
        freeCreditsGranted: true,
        signupIp: clientIp,
      },
      select: { credits: true },
    });

    if (creditsToGrant > 0) {
      await db.creditEvent.create({
        data: { userId: dbUser.id, type: "signup", amount: creditsToGrant },
      });
    } else {
      console.warn(`[analyze-page] Free credits denied — IP ${clientIp} has ${recentIpAccounts} recent accounts`);
    }

    dbUser = { ...dbUser, credits: updated.credits, freeCreditsGranted: true };
  }

  return <AnalysisPage initialCredits={dbUser?.credits ?? 0} />;
}
