/**
 * POST /api/credits/create-order
 * ================================
 * Creates a PayPal Order for the requested credit pack.
 * Returns the PayPal order ID so the client can render the PayPal button.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayPalOrder, CREDIT_PACKS, type PackKey } from "@/lib/paypal";

const RequestSchema = z.object({
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
    return NextResponse.json(
      { error: "Invalid pack selection." },
      { status: 422 },
    );
  }

  const { packKey } = parsed.data;
  const pack = CREDIT_PACKS[packKey as PackKey];

  try {
    const order = await createPayPalOrder(packKey as PackKey);
    return NextResponse.json({
      orderId: order.id,
      pack: { name: pack.name, credits: pack.credits, price: pack.price },
    });
  } catch (err) {
    console.error("[create-order] PayPal error:", err);
    return NextResponse.json(
      { error: "Failed to create PayPal order. Please try again." },
      { status: 500 },
    );
  }
}
