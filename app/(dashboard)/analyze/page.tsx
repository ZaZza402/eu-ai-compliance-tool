import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";

export const metadata: Metadata = { title: "New Analysis" };

export default async function AnalyzePage() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  // Try to upsert the user row. If the email already exists under a different
  // Clerk ID (e.g. a dev-era test account with the same email), the unique
  // constraint on `email` throws a P2002. In that case fall back to a
  // findFirst by email so the page still renders — the API route handles
  // proper user resolution on first submission.
  let credits = 0;
  try {
    const dbUser = await db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: 0,
      },
      update: {},
      select: { credits: true },
    });
    credits = dbUser.credits;
  } catch {
    // Unique email conflict — find whichever row owns this email
    const existing = await db.user.findFirst({
      where: { email },
      select: { credits: true },
    });
    credits = existing?.credits ?? 0;
  }

  return <AnalysisPage initialCredits={credits} />;
}
