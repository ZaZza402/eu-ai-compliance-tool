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
import { capturePayPalOrder, type PackKey } from "@/lib/paypal";

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

  // Check for duplicate capture (idempotency guard)
  const existing = await db.transaction.findUnique({
    where: { paypalOrderId: orderId },
  });
  if (existing) {
    if (existing.status === "completed") {
      return NextResponse.json({ success: true, alreadyCaptured: true });
    }
    // If it's pending/failed, continue to retry the capture
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
          creditsPurchased: capture.credits,
          amountUsd: capture.amountUsd,
          packName: capture.packName,
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
          credits: capture.credits,
        },
        update: {
          credits: { increment: capture.credits },
        },
      }),
      db.creditEvent.create({
        data: {
          userId,
          type: "purchase",
          amount: capture.credits,
          referenceId: orderId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      creditsAdded: capture.credits,
      packName: capture.packName,
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
