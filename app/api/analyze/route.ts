/**
 * POST /api/analyze
 * =================
 * Core analysis endpoint. Accepts a user's AI system description,
 * runs it through the EU AI Act retriever + Gemini 2.5 Flash (generateObject),
 * saves the structured result to DB, deducts 1 credit, and returns JSON.
 *
 * No streaming — returns the complete structured analysis in a single JSON
 * response. The client shows a multi-step loading state while waiting.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { retriever } from "@/lib/retriever";
import { expandQuery } from "@/lib/query-expansion";
import { analyzeLimiter } from "@/lib/rate-limit";
import { generateStructuredAnalysis } from "@/lib/gemini";

const RequestSchema = z.object({
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(5000),
});

export const maxDuration = 60; // seconds

export async function POST(req: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Rate limit ───────────────────────────────────────────────────────────
  const rateLimit = analyzeLimiter.check(userId);
  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSec.toString(),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
        },
      },
    );
  }

  // ── Parse & validate body ────────────────────────────────────────────────
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

  const { description } = parsed.data;

  // ── User fetch + deferred free-credit grant + query expansion (parallel) ─
  // expandQuery and the user credit setup run in parallel to save latency.
  const [dbUser, expandedTerms] = await Promise.all([
    (async () => {
      // Fetch or create user (credits default 0 — granted below after IP check)
      let user: { credits: number; freeCreditsGranted: boolean } =
        await db.user.upsert({
        where: { id: userId },
        create: { id: userId, email: `${userId}@pending.clerk`, credits: 0, freeCreditsGranted: false },
        update: {},
        select: { credits: true, freeCreditsGranted: true },
      });

      // ── Deferred free-credit grant with IP-abuse check ──────────────────
      // Free credits are NOT given at signup — they're granted here on first
      // use, after checking whether this IP has already sponsored >1 free
      // account in the last 30 days (prevents multi-account farming).
      if (!user.freeCreditsGranted) {
        if (user.credits > 0) {
          // Legacy user (exists before this feature) — already has credits;
          // just mark as granted so we skip this block on future requests.
          await db.user.update({
            where: { id: userId },
            data: { freeCreditsGranted: true },
          });
          user = { credits: user.credits, freeCreditsGranted: true };
        } else {
          // New user — run IP check
          const clientIp =
            (req as Request & { headers: Headers }).headers
              .get("x-forwarded-for")
              ?.split(",")[0]
              ?.trim() ??
            (req as Request & { headers: Headers }).headers.get("x-real-ip") ??
            "unknown";

          // Count distinct accounts from this IP that already received free credits
          // within the last 30 days (excluding the current user).
          const recentIpAccounts =
            clientIp !== "unknown"
              ? await db.user.count({
                  where: {
                    signupIp: clientIp,
                    freeCreditsGranted: true,
                    id: { not: userId },
                    createdAt: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                })
              : 0;

          // Allow ≤ 1 prior account from this IP in 30 days (2 total incl. this one).
          const creditsToGrant = recentIpAccounts < 2 ? 3 : 0;

          const updated = await db.user.update({
            where: { id: userId },
            data: {
              credits: { increment: creditsToGrant },
              freeCreditsGranted: true,
              signupIp: clientIp,
            },
            select: { credits: true, freeCreditsGranted: true },
          });

          if (creditsToGrant > 0) {
            await db.creditEvent.create({
              data: { userId, type: "signup", amount: creditsToGrant },
            });
          } else {
            console.warn(
              `[analyze] Free credits denied for userId=${userId} — IP ${clientIp} has ${recentIpAccounts} recent accounts`,
            );
          }

          user = updated;
        }
      }

      return user;
    })(),
    expandQuery(description),
  ]);

  if (dbUser.credits < 1) {
    return NextResponse.json(
      {
        error:
          "Insufficient credits. Please purchase a credit pack to continue.",
      },
      { status: 402 },
    );
  }

  // ── Heuristic pre-filter (candidate articles) ────────────────────────────
  // Append expanded terms to the retrieval query while keeping the original
  // description for the main Gemini analysis call.
  const retrievalQuery = expandedTerms
    ? `${description} ${expandedTerms}`
    : description;
  const suggestions = retriever.suggestArticlesForDescription(retrievalQuery);
  const suggestionKeys = Object.keys(suggestions.candidate_articles);

  // Pure numeric articles from keyword matching (up to 14 unique refs).
  const numericCandidates = suggestionKeys
    .filter((k) => /^\d+$/.test(k))
    .slice(0, 14);

  // ── Signal detection ────────────────────────────────────────────────────
  // Annex III (high-risk) — keys like "6+Annex_III_domain_1" or "6(2)+Annex_III(4)"
  const hasHighRiskSignal = suggestionKeys.some((k) =>
    k.toLowerCase().includes("annex_iii"),
  );
  // Annex I (medical device / product safety harmonisation legislation)
  const hasAnnexISignal = suggestionKeys.some(
    (k) =>
      k.toLowerCase().includes("annex_i") &&
      !k.toLowerCase().includes("annex_ii"),
  );
  // GPAI / foundation model signal
  const hasGpaiSignal = suggestionKeys.some((k) =>
    ["51", "52", "53", "54", "55"].includes(k),
  );

  // ── Extra articles triggered by signal ──────────────────────────────────
  const highRiskExtras = hasHighRiskSignal
    ? [
        "Annex_III", // high-risk categories list
        "Annex_IV", // technical documentation specification (Art.11 checklist)
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "27", // FRIA — provider→deployer documentation chain
        "43",
        "47",
        "49",
      ]
    : [];
  const annexIExtras = hasAnnexISignal
    ? ["Annex_I", "6", "8", "9", "10", "11", "13", "14", "15", "43", "47"]
    : [];
  const gpaiExtras = hasGpaiSignal
    ? [
        "51",
        "52",
        "53",
        "54",
        "55",
        "25",
        "Annex_XI",
        "Annex_XII",
        "Annex_XIII",
      ]
    : [];

  const candidateArticles = [
    ...new Set([
      ...numericCandidates,
      ...highRiskExtras,
      ...annexIExtras,
      ...gpaiExtras,
    ]),
  ];

  // ── Generate structured analysis ─────────────────────────────────────────
  let analysisOutput;
  try {
    analysisOutput = await generateStructuredAnalysis({
      description,
      candidateArticles,
    });
  } catch (aiErr) {
    console.error("[analyze] Gemini generateObject failed:", aiErr);
    return NextResponse.json(
      { error: "Analysis generation failed. Please try again." },
      { status: 500 },
    );
  }

  // ── Atomically save result + deduct credit ───────────────────────────────
  // Stamp _version: 2 so the app can distinguish this from legacy v1 records.
  const storedResult = { _version: 2 as const, ...analysisOutput };

  let savedAnalysis;
  try {
    savedAnalysis = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const analysis = await tx.analysis.create({
          data: {
            userId,
            description,
            result: storedResult,
            articlesHit: analysisOutput.articlesReferenced,
            riskLevel: analysisOutput.riskLevel,
            roleFound: analysisOutput.operatorRole,
            creditsUsed: 1,
          },
          select: { id: true },
        });
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
        });
        await tx.creditEvent.create({
          data: {
            userId,
            type: "usage",
            amount: -1,
            referenceId: analysis.id,
          },
        });
        return analysis;
      },
    );
  } catch (dbErr) {
    console.error("[analyze] DB save failed:", dbErr);
    // The AI generation succeeded — return the result even if saving failed.
    // The credit was NOT deducted, so the user can retry.
    return NextResponse.json(
      { error: "Analysis completed but could not be saved. Please try again." },
      { status: 500 },
    );
  }

  // ── Respond with structured result ───────────────────────────────────────
  return NextResponse.json({
    id: savedAnalysis.id,
    analysis: storedResult,
  });
}
