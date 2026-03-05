import { NextRequest, NextResponse } from "next/server";
import { contactLimiter } from "@/lib/rate-limit";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@alecsdesign.xyz";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function POST(req: NextRequest) {
  // ── Rate limit (keyed on IP) ────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rateLimit = contactLimiter.check(ip);
  if (!rateLimit.allowed) {
    const retryAfterSec = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": retryAfterSec.toString() } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email provider configured — acknowledge but skip sending
    return NextResponse.json({ ok: true, sent: false });
  }

  let body: { message?: string; email?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, email, userId } = body;
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const text = [
    `New feedback from Regumatrix`,
    ``,
    `Message:`,
    message,
    ``,
    `Reply-to email: ${email ?? "not provided"}`,
    `User ID:        ${userId ?? "anonymous"}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Regumatrix <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: email ?? undefined,
        subject: "New feedback submission",
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[contact] Resend error:", err);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("[contact] fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
