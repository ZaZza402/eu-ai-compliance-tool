import fs from "fs";
import path from "path";

export interface LegislationStatus {
  /** ISO date (YYYY-MM-DD) — auto-updated daily by the GitHub Action. */
  lastChecked: string;
  /** ISO date (YYYY-MM-DD) — set manually when regulation content is actually changed. */
  lastUpdated: string;
  /** Human-readable regulation version string. */
  version: string;
  /** Optional notes on what changed in the last update. */
  changeNotes: string;
}

let _cached: LegislationStatus | null = null;

export function getLegislationStatus(): LegislationStatus {
  if (_cached) return _cached;
  const filePath = path.join(
    process.cwd(),
    "eu_ai_act_json",
    "legislation-status.json",
  );
  _cached = JSON.parse(fs.readFileSync(filePath, "utf-8")) as LegislationStatus;
  return _cached;
}

/** Format an ISO date string (YYYY-MM-DD) as "12 Jul 2024" */
export function formatLegislationDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
