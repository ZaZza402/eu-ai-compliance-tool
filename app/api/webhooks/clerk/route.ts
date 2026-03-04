/**
 * POST /api/webhooks/clerk
 * ==========================
 * Receives Clerk webhook events to keep our DB in sync with Clerk users.
 *
 * Events handled:
 *   user.created  → create User in DB with 3 free credits
 *   user.updated  → update name / email
 *   user.deleted  → delete User (cascades to analyses and transactions)
 *
 * Setup in Clerk dashboard:
 *   Webhooks → Add endpoint → https://yourdomain.com/api/webhooks/clerk
 *   Events: user.created, user.updated, user.deleted
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set.");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  // Read Svix headers for signature verification
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers." },
      { status: 400 },
    );
  }

  const body = await req.text();

  // Verify signature
  const wh = new Webhook(webhookSecret);
  let event: { type: string; data: ClerkUserEvent };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUserEvent };
  } catch (err) {
    console.error("[clerk-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const { type, data } = event;

  // Helper: get primary email
  const getPrimaryEmail = (userData: ClerkUserEvent): string => {
    const primary = userData.email_addresses.find(
      (e) => e.id === userData.primary_email_address_id,
    );
    return (
      primary?.email_address ?? userData.email_addresses[0]?.email_address ?? ""
    );
  };

  try {
    switch (type) {
      case "user.created": {
        await db.$transaction([
          db.user.create({
            data: {
              id: data.id,
              email: getPrimaryEmail(data),
              firstName: data.first_name,
              lastName: data.last_name,
              imageUrl: data.image_url,
              credits: 3, // 3 free analyses on sign-up
            },
          }),
          db.creditEvent.create({
            data: {
              userId: data.id,
              type: "signup",
              amount: 3,
            },
          }),
        ]);
        console.log(`[clerk-webhook] User created: ${data.id}`);
        break;
      }

      case "user.updated": {
        await db.user.upsert({
          where: { id: data.id },
          create: {
            id: data.id,
            email: getPrimaryEmail(data),
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
            credits: 3,
          },
          update: {
            email: getPrimaryEmail(data),
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        });
        console.log(`[clerk-webhook] User updated: ${data.id}`);
        break;
      }

      case "user.deleted": {
        await db.user.delete({ where: { id: data.id } });
        console.log(`[clerk-webhook] User deleted: ${data.id}`);
        break;
      }

      default:
        // Not handling other event types
        break;
    }
  } catch (err) {
    console.error(
      `[clerk-webhook] DB operation failed for event ${type}:`,
      err,
    );
    return NextResponse.json(
      { error: "Webhook handler error." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
