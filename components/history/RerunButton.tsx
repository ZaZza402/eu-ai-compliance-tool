"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const LS_KEY = "eu_ai_last_description";

interface Props {
  description: string;
}

/**
 * Writes the given description to localStorage then navigates to /analyze,
 * which restores it automatically on mount via the AnalysisPage useEffect.
 */
export function RerunButton({ description }: Props) {
  const router = useRouter();

  function handleRerun() {
    localStorage.setItem(LS_KEY, description);
    router.push("/analyze");
  }

  return (
    <button
      type="button"
      onClick={handleRerun}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Re-run analysis
    </button>
  );
}
