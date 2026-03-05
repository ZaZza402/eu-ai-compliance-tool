"use client";

/**
 * AnalysisPage — schema-first structured AI output.
 * Features: localStorage persistence, AbortController cancel, skeleton
 * preview, fade-in result, auto-navigate countdown.
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Wand2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  BookOpen,
  X,
  ShieldCheck,
} from "lucide-react";
import { GuidedWizard } from "@/components/analysis/GuidedWizard";
import { ArticleDrawer } from "@/components/article/ArticleDrawer";
import { StructuredAnalysisDisplay } from "@/components/analysis/StructuredAnalysisDisplay";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type StoredStructuredResult } from "@/lib/analysis-schema";

const LS_KEY = "eu_ai_last_description";
const COUNTDOWN_SECS = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalyzeApiResponse {
  id: string;
  analysis: StoredStructuredResult;
}

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const FormSchema = z.object({
  description: z
    .string()
    .min(20, "Please describe your AI system in at least 20 characters.")
    .max(5000, "Description can be at most 5000 characters."),
});

type FormValues = z.infer<typeof FormSchema>;

// ---------------------------------------------------------------------------
// Loading steps
// ---------------------------------------------------------------------------

const LOADING_STEPS = [
  "Routing to relevant articles…",
  "Building legal grounding context…",
  "Generating compliance analysis…",
  "Cross-referencing obligations…",
  "Finalising compliance report…",
];

// ---------------------------------------------------------------------------
// Skeleton — mirrors the shape of the real result so the page doesn't jump
// ---------------------------------------------------------------------------

function ResultSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Top risk banner */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
      {/* Section cards grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border p-4"
          >
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* Key actions placeholder */}
      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* Article pills placeholder */}
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

function LoadingState({ step }: { step: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Analysing your AI system…</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This takes 20–40 seconds. Our AI engine is reading all relevant
              articles.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            {LOADING_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2.5 text-left">
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                ) : i === step ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                ) : (
                  <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    i < step
                      ? "text-muted-foreground line-through"
                      : i === step
                        ? "font-medium text-foreground"
                        : "text-muted-foreground/50",
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Skeleton preview below the steps — reduces perceived jump */}
      <ResultSkeleton />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  initialCredits: number;
}

export function AnalysisPage({ initialCredits }: Props) {
  const router = useRouter();
  const [credits, setCredits] = useState(initialCredits);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [result, setResult] = useState<StoredStructuredResult | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const description = watch("description", "");
  const charCount = description?.length ?? 0;

  // Restore last description from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setValue("description", saved, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist description as user types
  useEffect(() => {
    if (description) localStorage.setItem(LS_KEY, description);
  }, [description]);

  // Advance loading step on a timer while the request is in flight
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingStep((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 7000);
    return () => clearInterval(id);
  }, [isLoading]);

  // Countdown: auto-navigate to history detail after result
  function startCountdown(id: string) {
    let remaining = COUNTDOWN_SECS;
    setCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(null);
        router.push(`/history/${id}`);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }

  function cancelCountdown() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  }

  function cancelAnalysis() {
    abortRef.current?.abort();
    setIsLoading(false);
    setLoadingStep(0);
  }

  const onSubmit = async (values: FormValues) => {
    if (credits < 1) return;
    setResult(null);
    setAnalysisId(null);
    setError(null);
    setShowResult(false);
    cancelCountdown();
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: values.description }),
        signal: controller.signal,
      });

      const data = (await res.json()) as AnalyzeApiResponse | { error: string };

      if (!res.ok || "error" in data) {
        throw new Error(
          "error" in data ? data.error : `Server error ${res.status}`,
        );
      }

      setAnalysisId(data.id);
      setResult(data.analysis);
      setCredits((prev) => Math.max(0, prev - 1));
      localStorage.removeItem(LS_KEY);
      // 80 ms delay so the fade-in transition is visible
      setTimeout(() => setShowResult(true), 80);
      startCountdown(data.id);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Analysis</h1>
          <p className="mt-1 text-muted-foreground">
            Describe your AI system and get a structured, article-grounded
            compliance assessment.
          </p>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-2xl font-bold",
              credits <= 2 && credits > 0 ? "text-amber-600 dark:text-amber-400" : credits === 0 ? "text-destructive" : "",
            )}
          >
            {credits}
          </div>
          <div className="text-xs text-muted-foreground">credits left</div>
          {credits === 0 && (
            <Link
              href="/credits"
              className="mt-1 block text-xs font-medium text-primary underline underline-offset-2"
            >
              Buy more →
            </Link>
          )}
        </div>
      </div>

      {/* Low-credit warning */}
      {credits > 0 && credits <= 2 && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-2.5 text-sm dark:bg-amber-900/20">
          <span className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You only have {credits} credit{credits !== 1 ? "s" : ""} left.
          </span>
          <Link
            href="/credits"
            className="shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 dark:text-amber-400"
          >
            Top up →
          </Link>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium" htmlFor="description">
              Describe your AI system
            </label>
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium",
                "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <Wand2 className="h-3 w-3" />
              Guided wizard
            </button>
          </div>
          <textarea
            id="description"
            {...register("description")}
            rows={7}
            placeholder={`Describe what your AI system does, including:\n• What it predicts, decides, or generates\n• Who it affects (e.g. job applicants, patients, students)\n• How it's used (automated decision vs. human review)\n• Where it's deployed (EU market, affected EU persons)\n• Your role (building it yourself vs. using a third-party system)`}
            disabled={isLoading}
            className={cn(
              "w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.description ? "border-destructive" : "border-border",
            )}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Be specific — the more detail, the more accurate the analysis.
              </p>
            )}
            <span
              className={cn(
                "text-xs tabular-nums",
                charCount > 4500 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {charCount}/5000
            </span>
          </div>
        </div>

        {/* Submit row */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || credits < 1}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isLoading || credits < 1
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow hover:bg-primary/90",
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analysing…
              </span>
            ) : credits < 1 ? (
              "No credits — buy more"
            ) : (
              "Run analysis  (1 credit)"
            )}
          </button>

          {isLoading && (
            <button
              type="button"
              onClick={cancelAnalysis}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}

          {!isLoading && credits > 0 && !result && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Only charged if the analysis succeeds.
            </span>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state — steps + skeleton preview */}
      {isLoading && <LoadingState step={loadingStep} />}

      {/* Auto-nav countdown banner */}
      {countdown !== null && analysisId && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-50 px-5 py-3 text-sm dark:bg-emerald-900/20">
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            ✓ Report saved — opening your full report in {countdown}s…
          </span>
          <button
            type="button"
            onClick={cancelCountdown}
            className="shrink-0 text-xs text-emerald-600 underline underline-offset-2 hover:text-emerald-800 dark:text-emerald-400"
          >
            Stay on page
          </button>
        </div>
      )}

      {/* Structured result — fades in */}
      {result && analysisId && (
        <div
          className={cn(
            "transition-opacity duration-500",
            showResult ? "opacity-100" : "opacity-0",
          )}
        >
          <StructuredAnalysisDisplay
            result={result}
            analysisId={analysisId}
            onArticleClick={setSelectedArticle}
          />
        </div>
      )}

      {/* Article drawer */}
      <ArticleDrawer
        articleNum={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Guided wizard */}
      {isWizardOpen && (
        <GuidedWizard
          onComplete={(desc) => {
            setValue("description", desc, { shouldValidate: true });
            setIsWizardOpen(false);
          }}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
}
