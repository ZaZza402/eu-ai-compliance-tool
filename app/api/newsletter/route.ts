import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { newsletterLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = newsletterLimiter.check(ip);
  if (!rl.allowed) {
    const retry = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }

  let body: { email?: unknown; consent?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 },
    );
  }

  if (!consent) {
    return NextResponse.json(
      { error: "You must consent to receive update alerts." },
      { status: 400 },
    );
  }

  if (!AUDIENCE_ID) {
    // Dev mode — audience not configured, skip silently
    console.warn("[newsletter] RESEND_AUDIENCE_ID not set — skipping (dev)");
    return NextResponse.json({ ok: true });
  }

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    audienceId: AUDIENCE_ID,
  });

  if (error) {
    // 422 from Resend means the contact already exists — treat as success
    const msg = (error as { message?: string }).message ?? "";
    if (msg.toLowerCase().includes("already exists")) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    console.error("[newsletter] Resend error:", error);
    return NextResponse.json(
      { error: "Could not subscribe. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
