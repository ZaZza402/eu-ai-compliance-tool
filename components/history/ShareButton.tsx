"use client";

import { useState } from "react";
import { Share2, Check, X, Loader2, Copy } from "lucide-react";

interface Props {
  analysisId: string;
  /** If the analysis already has a share token, pass the full URL here. */
  initialShareUrl?: string;
}

/**
 * Allows the user to generate a public share link for their analysis.
 * Calls POST /api/share/[analysisId] to get/create a token.
 * Calls DELETE /api/share/[analysisId] to revoke it.
 */
export function ShareButton({ analysisId, initialShareUrl }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(initialShareUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  async function handleShare() {
    if (shareUrl) {
      // Already have a URL — just copy it
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${analysisId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setShareUrl(data.shareUrl);
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail — user can try again
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setRevoking(true);
    try {
      await fetch(`/api/share/${analysisId}`, { method: "DELETE" });
      setShareUrl(null);
    } catch {
      // silent
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        disabled={loading}
        title={shareUrl ? "Copy share link" : "Create share link"}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : shareUrl ? (
          <Copy className="h-3.5 w-3.5" />
        ) : (
          <Share2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied!" : shareUrl ? "Copy link" : "Share"}
      </button>

      {shareUrl && (
        <button
          onClick={handleRevoke}
          disabled={revoking}
          title="Revoke share link"
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
        >
          {revoking ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          Revoke
        </button>
      )}
    </div>
  );
}
