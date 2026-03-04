/**
 * POST /api/export-pdf
 * =======================
 * Generates a professional PDF compliance report for a saved analysis.
 * Accepts an analysis ID, fetches the record from the database,
 * then dispatches to the correct PDF template based on result version.
 *
 * Body:    { analysisId: string }
 * Response: application/pdf binary (downloadable)
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement, JSXElementConstructor } from "react";
import { db } from "@/lib/db";
import {
  isStructuredResult,
  type StoredStructuredResult,
} from "@/lib/analysis-schema";
import {
  ComplianceReportPdf,
  StructuredComplianceReportPdf,
} from "@/components/analysis/PdfDocument";

// Force Node.js runtime — @react-pdf/renderer needs Node APIs
export const runtime = "nodejs";

const RequestSchema = z.object({
  analysisId: z.string().min(1, "analysisId is required."),
});

export async function POST(req: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 422 },
    );
  }

  const { analysisId } = parsed.data;

  // ── Fetch analysis (ownership guard) ─────────────────────────────────────
  let analysis: {
    description: string;
    result: unknown;
    articlesHit: string[];
    riskLevel: string | null;
    createdAt: Date;
  } | null;

  try {
    analysis = await db.analysis.findUnique({
      where: { id: analysisId, userId },
      select: {
        description: true,
        result: true,
        articlesHit: true,
        riskLevel: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("[export-pdf] DB lookup failed:", err);
    return NextResponse.json(
      { error: "Database error. Please try again." },
      { status: 500 },
    );
  }

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  const generatedAt = analysis.createdAt.toISOString();

  // ── Dispatch to PDF template ──────────────────────────────────────────────
  let doc: ReactElement<
    DocumentProps,
    string | JSXElementConstructor<DocumentProps>
  >;

  if (isStructuredResult(analysis.result)) {
    // v2 — structured typed report
    doc = React.createElement(StructuredComplianceReportPdf, {
      systemDescription: analysis.description,
      result: analysis.result as StoredStructuredResult,
      citedArticles: analysis.articlesHit,
      generatedAt,
    }) as unknown as ReactElement<
      DocumentProps,
      string | JSXElementConstructor<DocumentProps>
    >;
  } else {
    // v1 — legacy markdown report
    const resultText =
      analysis.result &&
      typeof analysis.result === "object" &&
      "text" in analysis.result
        ? String((analysis.result as { text: string }).text)
        : "";

    doc = React.createElement(ComplianceReportPdf, {
      systemDescription: analysis.description,
      analysisMarkdown: resultText,
      citedArticles: analysis.articlesHit,
      riskLevel: analysis.riskLevel ?? null,
      generatedAt,
    }) as unknown as ReactElement<
      DocumentProps,
      string | JSXElementConstructor<DocumentProps>
    >;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  try {
    const pdfBuffer = await renderToBuffer(doc);

    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `EU_AI_Act_Compliance_Report_${dateStamp}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export-pdf] PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 },
    );
  }
}
