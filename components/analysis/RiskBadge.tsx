"use client";

import { parseRiskLevelClient } from "@/lib/utils-client";
import { RISK_LEVELS } from "@/lib/utils";

/**
 * RiskBadge
 * ==========
 * Parses the risk level from the completed AI response and displays
 * a prominent colour-coded badge.
 */
interface Props {
  text: string;
}

export function RiskBadge({ text }: Props) {
  const level = parseRiskLevelClient(text);
  if (!level) return null;

  const config = RISK_LEVELS[level];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${config.color} border-current/20`}
    >
      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${config.dotColor}`}
      />
      <div>
        <p className="font-semibold">{config.label}</p>
        <p className="mt-0.5 text-sm opacity-80">{config.description}</p>
      </div>
    </div>
  );
}
