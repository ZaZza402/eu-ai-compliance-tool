import { NextRequest, NextResponse } from "next/server";
import { contactLimiter } from "@/lib/rate-limit";

// nodemailer must be require()'d — ESM import causes "Unexpected token 'export'" in Next.js serverless
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// Config — only SMTP_USER (your email) and SMTP_PASS (password) needed.
// Host and port are hard-coded for mail.alecsdesign.xyz.
// ---------------------------------------------------------------------------
const SMTP_USER = process.env.SMTP_USER ?? "info@alecsdesign.xyz";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const TO_EMAIL  = process.env.SMTP_USER ?? "info@alecsdesign.xyz";

const SUBJECT_LABELS: Record<string, string> = {
  general:     "General Inquiry",
  bug:         "Bug Report",
  feature:     "Feature Request",
  billing:     "Billing",
  legal:       "Legal / GDPR",
  partnership: "Partnership",
};

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // Rate-limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = contactLimiter.check(ip);
  if (!rl.allowed) {
    const retry = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }

  // Parse body
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    category = "", name = "", email = "", message = "",
    company = "", browser = "", aiSystem = "", orderId = "",
  } = body;

  if (!category || !name.trim() || !email.trim() || !message.trim()) {
    return NextResponse.json(
      { error: "category, name, email and message are required" },
      { status: 400 },
    );
  }

  // Dev safety: skip send if password not configured
  if (!SMTP_PASS) {
    console.warn("[contact] SMTP_PASS not set — skipping send (dev mode)");
    return NextResponse.json({ ok: true, sent: false });
  }

  const label = SUBJECT_LABELS[category] ?? "Contact";

  // --- Plain text ---
  const extras: string[] = [];
  if (company)  extras.push(`Company      : ${company}`);
  if (browser)  extras.push(`Browser / OS : ${browser}`);
  if (aiSystem) extras.push(`AI System    : ${aiSystem}`);
  if (orderId)  extras.push(`Order ID     : ${orderId}`);

  const textBody = [
    `[Regumatrix] ${label}`,
    "¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦",
    `From     : ${name} <${email}>`,
    `Category : ${label}`,
    ...(extras.length ? ["", ...extras] : []),
    "",
    "¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦",
    message.trim(),
    "¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦¦",
    "Reply directly to this email to reach the sender.",
  ].join("\n");

  // --- HTML ---
  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const extraHtml = extras
    .map((line) => {
      const [key, ...rest] = line.split(":");
      return `<tr>
        <td style="color:#6b7280;padding:3px 12px 3px 0;white-space:nowrap;vertical-align:top">${safe(key.trim())}</td>
        <td style="padding:3px 0">${safe(rest.join(":").trim())}</td>
      </tr>`;
    })
    .join("");

  const htmlBody = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td>
<table width="100%" cellpadding="0" cellspacing="0"
  style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7">
  <tr><td style="background:#18181b;padding:20px 28px">
    <p style="margin:0;color:#fff;font-size:17px;font-weight:700">?? Regumatrix</p>
    <p style="margin:4px 0 0;color:#a1a1aa;font-size:12px">New message from the contact form</p>
  </td></tr>
  <tr><td style="padding:20px 28px 0">
    <span style="display:inline-block;background:#f4f4f5;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:0.6px">${safe(label)}</span>
  </td></tr>
  <tr><td style="padding:14px 28px 0">
    <table cellpadding="0" cellspacing="0" style="font-size:13px">
      <tr><td style="color:#6b7280;padding:3px 12px 3px 0;white-space:nowrap">From</td>
          <td style="padding:3px 0;font-weight:600">${safe(name)}</td></tr>
      <tr><td style="color:#6b7280;padding:3px 12px 3px 0;white-space:nowrap">Reply-to</td>
          <td style="padding:3px 0"><a href="mailto:${safe(email)}" style="color:#2563eb">${safe(email)}</a></td></tr>
      ${extraHtml}
    </table>
  </td></tr>
  <tr><td style="padding:16px 28px 0"><hr style="border:none;border-top:1px solid #e4e4e7;margin:0"/></td></tr>
  <tr><td style="padding:16px 28px 24px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Message</p>
    <div style="font-size:14px;line-height:1.65;color:#18181b;white-space:pre-wrap">${safe(message.trim())}</div>
  </td></tr>
  <tr><td style="background:#f4f4f5;padding:12px 28px">
    <p style="margin:0;font-size:11px;color:#a1a1aa">
      Submitted via <a href="https://regumatrix.eu/contact" style="color:#6b7280">regumatrix.eu/contact</a>.
      Reply directly to this email to respond to the sender.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  try {
    const transporter = nodemailer.createTransport({
      host:   "mail.alecsdesign.xyz",
      port:   587,
      secure: false, // STARTTLS
      auth:   { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from:    `"Regumatrix Contact" <${SMTP_USER}>`,
      to:      TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `[Regumatrix] ${label} from ${name}`,
      text:    textBody,
      html:    htmlBody,
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("[contact] SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
