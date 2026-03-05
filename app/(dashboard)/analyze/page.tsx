import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";

export const metadata: Metadata = { title: "New Analysis" };

export default async function AnalyzePage() {
  const user = await currentUser();
  if (!user) return null;

  // Upsert ensures the user exists in DB even if Clerk webhook was delayed.
  // credits defaults to 0 — the free credit grant happens in /api/analyze
  // after an IP-based abuse check on first submission.
  // Upsert ensures the user row exists even if the Clerk webhook was delayed.
  // credits: 0 is safe — the deferred IP-based grant runs in /api/analyze on
  // first submission, not here on page load.
  const dbUser = await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      credits: 0,
    },
    update: {},
    select: { credits: true },
  });

  return <AnalysisPage initialCredits={dbUser.credits} />;
}
