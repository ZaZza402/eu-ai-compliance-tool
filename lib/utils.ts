import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * Used by every shadcn/ui component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a USD amount for display.
 */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Format a date as a readable string.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Truncate text to a maximum number of characters.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Risk level display configuration.
 */
export const RISK_LEVELS = {
  prohibited: {
    label: "Prohibited",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotColor: "bg-red-500",
    description: "This AI practice is banned under Article 5.",
  },
  high_risk: {
    label: "High-Risk",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    dotColor: "bg-orange-500",
    description: "Requires full compliance with Articles 8–15.",
  },
  limited: {
    label: "Limited Transparency",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
    description: "Transparency obligations under Article 50.",
  },
  gpai: {
    label: "GPAI",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
    description: "General-Purpose AI Model obligations (Articles 51–55).",
  },
  minimal: {
    label: "Minimal Risk",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-green-500",
    description: "No mandatory obligations. Voluntary codes encouraged.",
  },
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;
