/**
 * GET /api/article/:id
 * ============================
 * Returns the full text and paragraphs for a single EU AI Act article
 * by its number (e.g. /api/article/9 → Article 9 content).
 *
 * Also accepts annex identifiers like /api/article/Annex_III.
 * Used by the client-side ArticleDrawer component.
 */

import { NextResponse } from "next/server";
import { retriever } from "@/lib/retriever";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || id.trim() === "") {
    return NextResponse.json(
      { error: "Article ID is required." },
      { status: 400 },
    );
  }

  // Sanitise — only allow digits, underscores, and letters (handles "Annex_III" etc.)
  if (!/^[\w\d_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid article ID." }, { status: 400 });
  }

  const article = retriever.getArticle(id);

  if (article.error) {
    return NextResponse.json({ error: article.error }, { status: 404 });
  }

  return NextResponse.json(article, {
    headers: {
      // Cache for 24 h — legislation text doesn't change
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
