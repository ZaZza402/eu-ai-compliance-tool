/**
 * PayPal Server-Side Integration
 * ================================
 * Implements PayPal Orders API v2 using the official
 * @paypal/paypal-server-sdk directly.
 * Server-only — never import in Client Components.
 */

import {
  Client,
  Environment,
  OrdersController,
  LogLevel,
  CheckoutPaymentIntent,
} from "@paypal/paypal-server-sdk";

// ---------------------------------------------------------------------------
// Credit pack definitions (must match the client-side pricing display)
// ---------------------------------------------------------------------------

export const CREDIT_PACKS = {
  starter: { name: "Pilot", price: "9.00", credits: 10 },
  growth: { name: "Mission", price: "29.00", credits: 40 },
  pro: { name: "Command", price: "79.00", credits: 120 },
} as const;

export type PackKey = keyof typeof CREDIT_PACKS;

// ---------------------------------------------------------------------------
// PayPal SDK client (singleton)
// ---------------------------------------------------------------------------

function getPayPalClient(): Client {
  const isProduction = process.env.PAYPAL_ENVIRONMENT === "production";

  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    },
    environment: isProduction ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel:
        process.env.NODE_ENV === "development" ? LogLevel.Info : LogLevel.Warn,
      logRequest: { logBody: false },
      logResponse: { logBody: false },
    },
  });
}

// ---------------------------------------------------------------------------
// Create a PayPal Order for a credit pack
// ---------------------------------------------------------------------------

export async function createPayPalOrder(
  packKey: PackKey,
): Promise<{ id: string }> {
  const pack = CREDIT_PACKS[packKey];
  if (!pack) throw new Error(`Unknown credit pack: ${packKey}`);

  const client = getPayPalClient();
  const ordersController = new OrdersController(client);

  const response = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: pack.price,
          },
          description: `EU AI Act Compliance — ${pack.name} Pack (${pack.credits} credits)`,
        },
      ],
    },
    prefer: "return=minimal",
  });

  const order = response.result;

  if (!order?.id) {
    throw new Error("PayPal order creation failed: no order ID returned.");
  }

  return { id: order.id };
}

// ---------------------------------------------------------------------------
// Capture a PayPal Order (after user approves on PayPal's side)
// ---------------------------------------------------------------------------

export interface CaptureResult {
  orderId: string;
  packName: string;
  credits: number;
  amountUsd: number;
  status: string;
}

export async function capturePayPalOrder(
  orderId: string,
  packKey: PackKey,
): Promise<CaptureResult> {
  const pack = CREDIT_PACKS[packKey];
  if (!pack) throw new Error(`Unknown credit pack: ${packKey}`);

  const client = getPayPalClient();
  const ordersController = new OrdersController(client);

  const response = await ordersController.captureOrder({
    id: orderId,
    prefer: "return=minimal",
    body: {},
  });

  const capture = response.result;

  if (!capture || capture.status !== "COMPLETED") {
    throw new Error(
      `PayPal capture failed. Status: ${capture?.status ?? "unknown"}`,
    );
  }

  return {
    orderId,
    packName: pack.name,
    credits: pack.credits,
    amountUsd: parseFloat(pack.price),
    status: capture.status,
  };
}

// ---------------------------------------------------------------------------
// Verify a PayPal webhook signature
// ---------------------------------------------------------------------------

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  rawBody: string,
): Promise<boolean> {
  // PayPal webhook verification via REST API
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("PAYPAL_WEBHOOK_ID not set — skipping webhook verification.");
    return true;
  }

  const isProduction = process.env.PAYPAL_ENVIRONMENT === "production";
  const baseUrl = isProduction
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  // Get access token
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) return false;
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Verify signature
  const verifyRes = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        transmission_id: headers["paypal-transmission-id"],
        transmission_time: headers["paypal-transmission-time"],
        cert_url: headers["paypal-cert-url"],
        auth_algo: headers["paypal-auth-algo"],
        transmission_sig: headers["paypal-transmission-sig"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );

  if (!verifyRes.ok) return false;
  const { verification_status } = (await verifyRes.json()) as {
    verification_status: string;
  };
  return verification_status === "SUCCESS";
}
