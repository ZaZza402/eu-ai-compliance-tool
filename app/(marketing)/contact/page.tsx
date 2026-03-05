"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Bug,
  Lightbulb,
  CreditCard,
  Scale,
  Handshake,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Category definitions — drives form fields and email template content
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    id: "general",
    label: "General Inquiry",
    icon: MessageSquare,
    description: "Questions about Regumatrix or how it works",
    placeholder:
      "Describe your question or what you'd like to know about Regumatrix…",
    subjectPrefix: "General Inquiry",
  },
  {
    id: "bug",
    label: "Technical Issue / Bug",
    icon: Bug,
    description: "Something is broken, erroring, or not working as expected",
    placeholder:
      "Describe what happened, what you expected, and steps to reproduce…",
    subjectPrefix: "Bug Report",
    extraFields: ["browser", "aiSystem"],
  },
  {
    id: "feature",
    label: "Feature Request",
    icon: Lightbulb,
    description: "Suggest an improvement or new capability",
    placeholder:
      "Describe the feature you'd like to see and the problem it would solve…",
    subjectPrefix: "Feature Request",
  },
  {
    id: "billing",
    label: "Billing & Credits",
    icon: CreditCard,
    description: "Payment issues, refunds, or questions about your credits",
    placeholder: "Describe your billing issue or question…",
    subjectPrefix: "Billing",
    extraFields: ["orderId"],
  },
  {
    id: "legal",
    label: "Legal / GDPR / Data",
    icon: Scale,
    description: "Data deletion, GDPR rights, privacy requests",
    placeholder:
      "Describe your specific data or legal request. Be as precise as possible…",
    subjectPrefix: "Legal / GDPR Request",
  },
  {
    id: "partnership",
    label: "Business / Partnership",
    icon: Handshake,
    description: "Enterprise licensing, reseller enquiries, press",
    placeholder:
      "Tell us about your organisation and the kind of collaboration you have in mind…",
    subjectPrefix: "Partnership / Business",
    extraFields: ["company"],
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface FormState {
  category: CategoryId | "";
  name: string;
  email: string;
  message: string;
  // extra contextual fields
  company: string;
  browser: string;
  aiSystem: string;
  orderId: string;
}

const INITIAL: FormState = {
  category: "",
  name: "",
  email: "",
  message: "",
  company: "",
  browser: "",
  aiSystem: "",
  orderId: "",
};

type Status = "idle" | "loading" | "success" | "error";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCat = CATEGORIES.find((c) => c.id === form.category);
  const showExtra = (field: string) =>
    selectedCat?.extraFields?.includes(field as never) ?? false;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Send failed");
      }
      setStatus("success");
      setForm(INITIAL);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Contact</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-muted-foreground">
            All enquiries go through this form. Select the category that best
            describes your request so we can respond faster.
          </p>
        </div>

        {/* Success state */}
        {status === "success" && (
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800/40 dark:bg-green-900/20">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700 dark:text-green-400" />
            <div>
              <p className="font-semibold text-foreground">Message sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We've received your message and will get back to you at the
                email address you provided. Response times are typically 1–2
                business days.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-3 text-sm font-medium text-primary underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category picker */}
            <div>
              <label className="mb-2.5 block text-sm font-medium">
                What is this about?{" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => set("category", cat.id)}
                      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-card hover:border-primary/30 hover:bg-accent"
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}
                        >
                          {cat.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name + Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
                  Your name <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
                  Your email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Contextual extra fields */}
            {showExtra("company") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="company">
                  Company / Organisation
                </label>
                <input
                  id="company"
                  type="text"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            {showExtra("browser") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="browser">
                  Browser &amp; OS{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (helps us reproduce the bug)
                  </span>
                </label>
                <input
                  id="browser"
                  type="text"
                  value={form.browser}
                  onChange={(e) => set("browser", e.target.value)}
                  placeholder="e.g. Chrome 122 on macOS 14"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-2">
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="aiSystem">
                    AI system description{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (if relevant to the bug)
                    </span>
                  </label>
                  <input
                    id="aiSystem"
                    type="text"
                    value={form.aiSystem}
                    onChange={(e) => set("aiSystem", e.target.value)}
                    placeholder="e.g. HR CV screening tool"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
            {showExtra("orderId") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="orderId">
                  Order / Transaction ID{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (if you have one)
                  </span>
                </label>
                <input
                  id="orderId"
                  type="text"
                  value={form.orderId}
                  onChange={(e) => set("orderId", e.target.value)}
                  placeholder="e.g. PAY-XXXXXXXXXXXX"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="message">
                Message <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder={
                  selectedCat?.placeholder ??
                  "Select a category above, then describe your request…"
                }
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* Error banner */}
            {status === "error" && errorMsg && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errorMsg}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                We typically respond within 1–2 business days.
              </p>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
