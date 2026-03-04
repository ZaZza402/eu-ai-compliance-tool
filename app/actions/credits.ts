"use server";

/**
 * app/actions/credits.ts
 * =======================
 * Type-safe server actions for the PayPal credit-purchase flow.
 * Replaces raw fetch() calls to /api/credits/* from the client.
 *
 * Actions:
 *   createOrderAction  — creates a PayPal order, returns orderId
 *   captureOrderAction — captures an approved order, credits the user
 */

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { db } from "@/lib/db";
import {
  createPayPalOrder,
  capturePayPalOrder,
  CREDIT_PACKS,
  type PackKey,
} from "@/lib/paypal";

const packKeySchema = z.enum(["starter", "growth", "pro"]);

// ---------------------------------------------------------------------------
// createOrderAction
// ---------------------------------------------------------------------------

export const createOrderAction = authActionClient
  .schema(
    z.object({
      packKey: packKeySchema,
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { packKey } = parsedInput;
    const { userId } = ctx;

    void userId; // auth guard — userId confirms authenticated user

    const pack = CREDIT_PACKS[packKey as PackKey];
    const order = await createPayPalOrder(packKey as PackKey);

    return {
      orderId: order.id,
      pack: {
        name: pack.name,
        credits: pack.credits,
        price: pack.price,
      },
    };
  });

// ---------------------------------------------------------------------------
// captureOrderAction
// ---------------------------------------------------------------------------

export const captureOrderAction = authActionClient
  .schema(
    z.object({
      orderId: z.string().min(1),
      packKey: packKeySchema,
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { orderId, packKey } = parsedInput;
    const { userId } = ctx;

    // Idempotency guard — don't double-capture
    const existing = await db.transaction.findUnique({
      where: { paypalOrderId: orderId },
    });
    if (existing?.status === "completed") {
      return {
        success: true,
        alreadyCaptured: true,
        creditsAdded: 0,
        packName: existing.packName,
      };
    }

    const capture = await capturePayPalOrder(orderId, packKey as PackKey);

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
        update: { status: "completed" },
      }),
      db.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `${userId}@pending.clerk`,
          credits: capture.credits,
        },
        update: { credits: { increment: capture.credits } },
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

    return {
      success: true,
      alreadyCaptured: false,
      creditsAdded: capture.credits,
      packName: capture.packName,
    };
  });
