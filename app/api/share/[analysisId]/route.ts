import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * POST /api/share/[analysisId]
 * ---------------------------
 * Generates (or returns existing) a public share token for an analysis.
 * The caller must own the analysis.
 *
 * Returns { shareUrl: "https://regumatrix.eu/report/<token>" }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { analysisId } = await params;

  // Verify ownership
  const analysis = await db.analysis.findFirst({
    where: { id: analysisId, userId },
    select: { id: true, shareToken: true },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If already has a token, return it
  if (analysis.shareToken) {
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://regumatrix.eu"}/report/${analysis.shareToken}`;
    return NextResponse.json({ shareUrl, token: analysis.shareToken });
  }

  // Generate a new token
  const token = crypto.randomUUID().replace(/-/g, "");

  await db.analysis.update({
    where: { id: analysisId },
    data: { shareToken: token },
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://regumatrix.eu"}/report/${token}`;
  return NextResponse.json({ shareUrl, token });
}

/**
 * DELETE /api/share/[analysisId]
 * ---------------------------
 * Revokes the share token. The link will stop working.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { analysisId } = await params;

  const analysis = await db.analysis.findFirst({
    where: { id: analysisId, userId },
    select: { id: true },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.analysis.update({
    where: { id: analysisId },
    data: { shareToken: null },
  });

  return NextResponse.json({ ok: true });
}
