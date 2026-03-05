import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { contactLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Env config
// ---------------------------------------------------------------------------
const SMTP_HOST = process.env.SMTP_HOST ?? "mail.alecsdesign.xyz";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER ?? "info@alecsdesign.xyz";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@alecsdesign.xyz";

// ---------------------------------------------------------------------------
// Typed incoming payload
// ---------------------------------------------------------------------------
interface ContactPayload {
  category: string;
  name: string;
  email: string;
  message: string;
  company?: string;
  browser?: string;
  aiSystem?: string;
  orderId?: string;
}

// ---------------------------------------------------------------------------
// Category → subject prefix map
// ---------------------------------------------------------------------------
const SUBJECT_PREFIXES: Record<string, string> = {
  general: "General Inquiry",
  bug: "Bug Report",
  feature: "Feature Request",
  billing: "Billing",
  legal: "Legal / GDPR Request",
  partnership: "Partnership / Business",
};

// ---------------------------------------------------------------------------
// Build plain-text email body
// ---------------------------------------------------------------------------
function buildEmailBody(p: ContactPayload): string {
  const prefix = SUBJECT_PREFIXES[p.category] ?? "Contact";
  const hr = "─".repeat(60);
  const contextLines: string[] = [];
  if (p.company) contextLines.push(`Company/Organisation : ${p.company}`);
  if (p.browser) contextLines.push(`Browser & OS         : ${p.browser}`);
  if (p.aiSystem) contextLines.push(`AI System            : ${p.aiSystem}`);
  if (p.orderId) contextLines.push(`Order/Transaction ID : ${p.orderId}`);

  return [
    `REGUMATRIX — ${prefix.toUpperCase()}`,
    hr,
    ``,
    `FROM    : ${p.name} <${p.email}>`,
    `CATEGORY: ${prefix}`,
    ...(contextLines.length
      ? ["", "── Additional Context ──", ...contextLines]
      : []),
    ``,
    hr,
    `MESSAGE`,
    hr,
    ``,
    p.message.trim(),
    ``,
    hr,
    `Received via regumatrix.eu/contact`,
    `Reply directly to this email to respond to the sender.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Build HTML email body
// ---------------------------------------------------------------------------
function buildEmailHtml(p: ContactPayload): string {
  const prefix = SUBJECT_PREFIXES[p.category] ?? "Contact";
  const extraRows: string[] = [];
  if (p.company)
    extraRows.push(
      `<tr><td style="color:#6b7280;padding:4px 0;width:160px;vertical-align:top">Company</td><td style="padding:4px 0">${p.company}</td></tr>`,
    );
  if (p.browser)
    extraRows.push(
      `<tr><td style="color:#6b7280;padding:4px 0;width:160px;vertical-align:top">Browser &amp; OS</td><td style="padding:4px 0">${p.browser}</td></tr>`,
    );
  if (p.aiSystem)
    extraRows.push(
      `<tr><td style="color:#6b7280;padding:4px 0;width:160px;vertical-align:top">AI System</td><td style="padding:4px 0">${p.aiSystem}</td></tr>`,
    );
  if (p.orderId)
    extraRows.push(
      `<tr><td style="color:#6b7280;padding:4px 0;width:160px;vertical-align:top">Order ID</td><td style="padding:4px 0">${p.orderId}</td></tr>`,
    );

  const safeMsg = p.message
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
  <tr><td style="background:#18181b;padding:24px 32px">
    <p style="margin:0;color:#fff;font-size:18px;font-weight:700">⚖️ Regumatrix</p>
    <p style="margin:4px 0 0;color:#a1a1aa;font-size:13px">New contact form submission</p>
  </td></tr>
  <tr><td style="padding:24px 32px 0">
    <span style="display:inline-block;background:#f4f4f5;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#18181b;letter-spacing:0.5px;text-transform:uppercase">${prefix}</span>
  </td></tr>
  <tr><td style="padding:16px 32px 0">
    <table cellpadding="0" cellspacing="0" style="font-size:14px">
      <tr><td style="color:#6b7280;padding:4px 0;width:160px;vertical-align:top">From</td><td style="padding:4px 0;font-weight:500">${p.name}</td></tr>
      <tr><td style="color:#6b7280;padding:4px 0;vertical-align:top">Reply-to</td><td style="padding:4px 0"><a href="mailto:${p.email}" style="color:#2563eb">${p.email}</a></td></tr>
      ${extraRows.join("\n      ")}
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 0"><hr style="border:none;border-top:1px solid #e4e4e7;margin:0"/></td></tr>
  <tr><td style="padding:20px 32px">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Message</p>
    <div style="font-size:14px;line-height:1.6;color:#18181b;white-space:pre-wrap">${safeMsg}</div>
  </td></tr>
  <tr><td style="background:#f4f4f5;padding:16px 32px">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Submitted via <a href="https://regumatrix.eu/contact" style="color:#6b7280">regumatrix.eu/contact</a>. Reply directly to this email to respond to the sender.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
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

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, name, email, message } = payload;
  if (!category || !name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "category, name, email and message are required" },
      { status: 400 },
    );
  }

  if (!SMTP_PASS) {
    console.warn("[contact] SMTP_PASS not set — skipping email send");
    return NextResponse.json({ ok: true, sent: false });
  }

  const prefix = SUBJECT_PREFIXES[category] ?? "Contact";
  const subject = `[Regumatrix] ${prefix} from ${name}`;

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Regumatrix Contact" <${SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject,
      text: buildEmailBody(payload),
      html: buildEmailHtml(payload),
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("[contact] SMTP error:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
