"use client";

/**
 * ExportPdfButton
 * ================
 * Triggers PDF generation by passing the analysis ID to /api/export-pdf.
 * The route fetches the analysis from DB server-side and renders the PDF —
 * no analysis data flows through the client.
 */

import { useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** DB ID of the saved analysis record. */
  analysisId: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function ExportPdfButton({ analysisId }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async () => {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });

      if (!res.ok) {
        let msg = `Server error ${res.status}`;
        try {
          const json = (await res.json()) as { error?: string };
          if (json.error) msg = json.error;
        } catch {
          /* ignore parse error */
        }
        throw new Error(msg);
      }

      // Download the PDF blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const filename = `EU_AI_Act_Compliance_Report_${dateStamp}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Revoke the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setStatus("success");
      // Reset back to idle after 3 s
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate PDF.";
      setErrorMsg(msg);
      setStatus("error");
      // Reset after 5 s
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg(null);
      }, 5000);
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={isLoading}
        title={isError ? (errorMsg ?? "Export failed") : "Download as PDF"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isLoading && "cursor-not-allowed opacity-60",
          isSuccess &&
            "bg-green-100 text-green-950 dark:bg-green-900/30 dark:text-green-200",
          isError && "bg-destructive/10 text-destructive",
          !isLoading &&
            !isSuccess &&
            !isError &&
            "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isSuccess && <CheckCircle2 className="h-3.5 w-3.5" />}
        {isError && <AlertCircle className="h-3.5 w-3.5" />}
        {!isLoading && !isSuccess && !isError && (
          <Download className="h-3.5 w-3.5" />
        )}
        {isLoading
          ? "Generating PDF…"
          : isSuccess
            ? "Downloaded!"
            : isError
              ? "Export failed"
              : "Export PDF"}
      </button>
    </div>
  );
}
