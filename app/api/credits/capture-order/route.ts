/**
 * POST /api/credits/capture-order
 * =================================
 * Captures an approved PayPal Order and credits the user's account.
 * This is called by the client after the user approves payment in the PayPal UI.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { capturePayPalOrder, CREDIT_PACKS, type PackKey } from "@/lib/paypal";

const RequestSchema = z.object({
  orderId: z.string().min(1),
  packKey: z.enum(["starter", "growth", "pro"]),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  const { orderId, packKey } = parsed.data;

  // ── Security: look up the authoritative pack details from our DB ─────────
  // The create-order endpoint wrote these server-side, so the user-submitted
  // packKey cannot be used to upgrade to a more expensive pack for free.
  const pending = await db.transaction.findUnique({
    where: { paypalOrderId: orderId },
    select: {
      status: true,
      creditsPurchased: true,
      amountUsd: true,
      packName: true,
      userId: true,
    },
  });

  if (pending?.status === "completed") {
    return NextResponse.json({ success: true, alreadyCaptured: true });
  }

  // Determine credits/amount from DB record if available; fall back to user-supplied
  // packKey only for legacy orders that pre-date this server-side record (none in prod).
  const resolvedPack = pending
    ? {
        credits: pending.creditsPurchased,
        amountUsd: pending.amountUsd,
        packName: pending.packName,
      }
    : (() => {
        const p = CREDIT_PACKS[packKey as PackKey];
        return {
          credits: p.credits,
          amountUsd: parseFloat(p.price),
          packName: p.name,
        };
      })();

  // Ownership check — ensure this order belongs to the authenticated user
  if (pending && pending.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const capture = await capturePayPalOrder(orderId, packKey as PackKey);

    // Atomically: record the transaction + add credits + write audit event
    await db.$transaction([
      db.transaction.upsert({
        where: { paypalOrderId: orderId },
        create: {
          userId,
          paypalOrderId: orderId,
          creditsPurchased: resolvedPack.credits,
          amountUsd: resolvedPack.amountUsd,
          packName: resolvedPack.packName,
          status: "completed",
        },
        update: {
          status: "completed",
        },
      }),
      db.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `${userId}@pending.clerk`,
          credits: resolvedPack.credits,
        },
        update: {
          credits: { increment: resolvedPack.credits },
        },
      }),
      db.creditEvent.create({
        data: {
          userId,
          type: "purchase",
          amount: resolvedPack.credits,
          referenceId: orderId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      creditsAdded: resolvedPack.credits,
      packName: resolvedPack.packName,
    });
  } catch (err) {
    console.error("[capture-order] Error:", err);

    // Mark transaction as failed for audit trail
    await db.transaction
      .upsert({
        where: { paypalOrderId: orderId },
        create: {
          userId,
          paypalOrderId: orderId,
          creditsPurchased: 0,
          amountUsd: 0,
          packName: packKey,
          status: "failed",
        },
        update: { status: "failed" },
      })
      .catch(() => {}); // Don't throw if this also fails

    return NextResponse.json(
      {
        error:
          "Payment capture failed. If charged, contact support with your order ID.",
      },
      { status: 500 },
    );
  }
}
