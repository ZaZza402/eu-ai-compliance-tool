"use client";

import { useMemo } from "react";

// ─── Fixed EU AI Act compliance milestones ────────────────────────────────────
// utcDate uses Date.UTC so comparisons are timezone-agnostic.
const MILESTONES = [
  {
    utcDate: Date.UTC(2024, 7, 1), // Aug 1, 2024
    label: "Aug 1, 2024",
    title: "Regulation enters into force",
    detail:
      "Regulation (EU) 2024/1689 published in the Official Journal. The legal framework is live.",
    urgent: false,
  },
  {
    utcDate: Date.UTC(2025, 1, 2), // Feb 2, 2025
    label: "Feb 2, 2025",
    title: "Prohibited AI — immediate ban",
    detail:
      "All AI practices listed in Article 5 are forbidden, including certain biometric categorisation and real-time remote biometric ID in public spaces.",
    urgent: false,
  },
  {
    utcDate: Date.UTC(2025, 7, 2), // Aug 2, 2025
    label: "Aug 2, 2025",
    title: "GPAI model obligations apply",
    detail:
      "Providers of general-purpose AI models must comply with transparency, copyright, and systemic-risk obligations (Art. 51–55).",
    urgent: false,
  },
  {
    utcDate: Date.UTC(2026, 7, 2), // Aug 2, 2026
    label: "Aug 2, 2026",
    title: "High-risk AI: full obligations",
    detail:
      "Risk management system, data governance, technical documentation, human oversight, EU database registration — all mandatory. Penalties up to €30M or 6% of global turnover.",
    urgent: true,
  },
  {
    utcDate: Date.UTC(2027, 7, 2), // Aug 2, 2027
    label: "Aug 2, 2027",
    title: "Legacy high-risk systems",
    detail:
      "High-risk AI already on the market before August 2024 must comply by this extended deadline.",
    urgent: false,
  },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayUTC(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function formatMonthYear(utcMs: number): string {
  return new Date(utcMs).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Returns a human-readable relative distance, e.g. "~5 months away" or "18 days away". */
function relativeLabel(fromMs: number, toMs: number): string {
  const diffMs = toMs - fromMs;
  if (diffMs <= 0) return "due today";
  const days = diffMs / (1000 * 60 * 60 * 24);
  if (days < 32) {
    const d = Math.round(days);
    return `${d} day${d !== 1 ? "s" : ""} away`;
  }
  const months = Math.round(days / 30.44);
  return `~${months} month${months !== 1 ? "s" : ""} away`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MilestoneSlot = {
  kind: "milestone";
  label: string;
  title: string;
  detail: string;
  done: boolean;
  urgent: boolean;
  utcDate: number;
};
type CurrentSlot = { kind: "current"; label: string };
type Slot = MilestoneSlot | CurrentSlot;

// ─── Component ────────────────────────────────────────────────────────────────

export function ComplianceTimeline() {
  const { slots, subtitle } = useMemo(() => {
    const today = todayUTC();

    // Index of the first milestone that hasn't passed yet
    const firstUpcomingIdx = MILESTONES.findIndex((m) => m.utcDate > today);
    // "You are here" goes before the first upcoming, or at the very end if all done
    const insertBefore =
      firstUpcomingIdx === -1 ? MILESTONES.length : firstUpcomingIdx;

    // Build the flat display list
    const list: Slot[] = [];
    MILESTONES.forEach((m, i) => {
      if (i === insertBefore) {
        list.push({ kind: "current", label: `Today — ${formatMonthYear(today)}` });
      }
      list.push({
        kind: "milestone",
        label: m.label,
        title: m.title,
        detail: m.detail,
        done: m.utcDate <= today,
        urgent: m.urgent,
        utcDate: m.utcDate,
      });
    });
    if (insertBefore === MILESTONES.length) {
      list.push({ kind: "current", label: `Today — ${formatMonthYear(today)}` });
    }

    // Dynamic subtitle — find the next urgent deadline for the "high-risk" sentence
    const nextUrgent =
      firstUpcomingIdx !== -1
        ? MILESTONES.slice(firstUpcomingIdx).find((m) => m.urgent) ?? null
        : null;

    const sub = nextUrgent
      ? `EU AI Act obligations are phased in over multiple years. If your system is high-risk, the full compliance deadline is ${relativeLabel(today, nextUrgent.utcDate)}.`
      : firstUpcomingIdx !== -1
        ? `EU AI Act obligations are phased in over multiple years. The next compliance phase activates ${relativeLabel(today, MILESTONES[firstUpcomingIdx].utcDate)}.`
        : "EU AI Act obligations are fully in force. Ensure your AI systems are compliant.";

    return { slots: list, subtitle: sub };
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          The clock is already running
        </h2>
        <p className="mb-12 text-center text-sm text-muted-foreground">
          {subtitle}
        </p>

        <div className="relative">
          {slots.map((slot, index) => {
            const isLast = index === slots.length - 1;
            const connector = !isLast && (
              <div className="absolute left-2.75 top-6 h-full w-px bg-border" />
            );

            // ── "You are here" marker ──────────────────────────────────────
            if (slot.kind === "current") {
              return (
                <div key="current" className="relative flex gap-5">
                  {connector}
                  <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="pb-8">
                    <span className="text-xs font-semibold text-primary">
                      {slot.label}
                    </span>
                    <p className="mt-0.5 text-sm font-semibold text-primary">
                      You are here
                    </p>
                  </div>
                </div>
              );
            }

            // ── Regular milestone ──────────────────────────────────────────
            const today = todayUTC();
            return (
              <div key={slot.label} className="relative flex gap-5">
                {connector}
                <div
                  className={`relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    slot.done
                      ? "border-green-500 bg-green-500"
                      : slot.urgent
                        ? "border-orange-500 bg-card"
                        : "border-border bg-card"
                  }`}
                >
                  {slot.done && (
                    <span className="text-[10px] font-bold text-white">✓</span>
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        slot.done
                          ? "text-muted-foreground"
                          : slot.urgent
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {slot.label}
                    </span>
                    {!slot.done && slot.urgent && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {relativeLabel(today, slot.utcDate)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-sm font-semibold ${
                      slot.done ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {slot.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {slot.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
