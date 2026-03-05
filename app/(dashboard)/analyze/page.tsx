import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";

export const metadata: Metadata = { title: "New Analysis" };

export default async function AnalyzePage() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  // Upsert the user row. If the same email exists under a different Clerk ID
  // (dev account reused in production) the unique constraint throws — fall
  // back to findFirst so the page still renders correctly.
  let credits = 0;
  try {
    const dbUser = await db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: 3,
      },
      update: {},
      select: { credits: true },
    });
    credits = dbUser.credits;
  } catch {
    const existing = await db.user.findFirst({
      where: { email },
      select: { credits: true },
    });
    credits = existing?.credits ?? 0;
  }

  return <AnalysisPage initialCredits={credits} />;
}
