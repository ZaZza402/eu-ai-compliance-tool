"use client";

/**
 * GuidedWizard
 * =============
 * A 6-step guided questionnaire that helps users who don't know how to
 * describe their AI system compose a thorough, structured description.
 *
 * Steps:
 *   1. What does your AI system do? (purpose)
 *   2. Who does it affect? (affected persons — multi-select)
 *   3. How automated is the decision-making?
 *   4. Where is it deployed?
 *   5. What is your role?
 *   6. Which sector does it operate in? (multi-select)
 *   7. Review + edit the composed description → onComplete()
 *
 * Usage:
 *   <GuidedWizard onComplete={(desc) => setFieldValue(desc)} onClose={close} />
 */

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Cpu,
  Eye,
  HelpCircle,
  Filter,
  Globe,
  MapPin,
  Code2,
  Layers,
  Package,
  Share2,
  Wand2,
  Check,
  Building2,
  Users2,
  Briefcase,
  Fingerprint,
  Database,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardAnswers {
  // Step 0
  purpose: string | null;
  // Step 1
  affectedPersons: string[];
  // Step 2
  automation: string | null;
  // Step 3
  deployment: string | null;
  // Step 4
  role: string | null;
  // Step 5
  sectors: string[];
  // Step 6 — covers the 5 common clarification warning types
  dataTypes: string[];
  biometricType: string | null; // only relevant when "Biometric data" is in dataTypes
  systemTraits: string[];
  deployerProfile: string | null;
}

const INITIAL_ANSWERS: WizardAnswers = {
  purpose: null,
  affectedPersons: [],
  automation: null,
  deployment: null,
  role: null,
  sectors: [],
  dataTypes: [],
  biometricType: null,
  systemTraits: [],
  deployerProfile: null,
};

interface Props {
  onComplete: (description: string) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Step configuration data
// ---------------------------------------------------------------------------

const PURPOSE_OPTIONS = [
  {
    value: "classify_filter",
    label: "Classify, rank, or filter",
    detail: "Sorts or scores people, documents, or requests",
    icon: Filter,
  },
  {
    value: "generate_content",
    label: "Generate content",
    detail: "Produces text, images, audio, video, or code",
    icon: Sparkles,
  },
  {
    value: "predict_recommend",
    label: "Predict or recommend",
    detail: "Forecasts outcomes or suggests actions",
    icon: TrendingUp,
  },
  {
    value: "control_physical",
    label: "Control physical systems",
    detail: "Operates robots, vehicles, or infrastructure components",
    icon: Cpu,
  },
  {
    value: "monitor_surveil",
    label: "Monitor or surveil",
    detail: "Tracks people's behaviour, location, or data patterns",
    icon: Eye,
  },
  {
    value: "other",
    label: "Other / not sure",
    detail: "My system doesn't clearly fit any of the above",
    icon: HelpCircle,
  },
];

const AFFECTED_OPTIONS = [
  "Job applicants or employees",
  "Students or people being assessed",
  "Patients or people seeking healthcare",
  "People seeking credit, insurance, or benefits",
  "People in law enforcement or judicial processes",
  "Immigrants or asylum seekers",
  "General consumers",
  "No specific individuals — internal business process",
];

const AUTOMATION_OPTIONS = [
  {
    value: "fully_automated",
    label: "Fully automated",
    detail: "System decides or acts without any human review",
  },
  {
    value: "human_reviews",
    label: "Human reviews before action",
    detail: "A person checks the AI's output before it is acted on",
  },
  {
    value: "advisory",
    label: "Advisory tool",
    detail: "AI advises; a human makes all final decisions",
  },
  {
    value: "overridable",
    label: "Always overridable",
    detail: "System can be overridden by a human at any time",
  },
];

const DEPLOYMENT_OPTIONS = [
  {
    value: "eu_yes",
    label: "Yes — EU deployment",
    detail: "Will be used in the EU or will affect EU residents",
    icon: Globe,
  },
  {
    value: "eu_no",
    label: "No — outside EU only",
    detail: "Strictly deployed outside the European Union",
    icon: MapPin,
  },
  {
    value: "eu_unsure",
    label: "Not sure",
    detail: "May affect EU persons; I'm uncertain",
    icon: HelpCircle,
  },
];

const ROLE_OPTIONS = [
  {
    value: "provider",
    label: "Developer / Provider",
    detail: "I'm building this AI system myself (own code, own model)",
    icon: Code2,
  },
  {
    value: "deployer",
    label: "Deployer",
    detail: "I'm deploying or using someone else's AI system",
    icon: Layers,
  },
  {
    value: "both",
    label: "Both (building + using in-house)",
    detail: "I build it for our own organisation's use",
    icon: Package,
  },
  {
    value: "distributor",
    label: "Distributor / Reseller",
    detail: "I resell or distribute an existing AI system",
    icon: Share2,
  },
];

const SECTOR_OPTIONS = [
  "Employment & workforce management",
  "Education & training / academic assessment",
  "Critical infrastructure (energy, water, transport)",
  "Healthcare & medicine",
  "Law enforcement",
  "Migration, asylum & border control",
  "Administration of justice",
  "Financial services (banking, insurance, credit)",
  "Biometric identification or categorisation",
  "Safety components in regulated products (medical devices, vehicles, etc.)",
  "None of the above",
];

// ── Step 6 data ────────────────────────────────────────────────────────────────────

// What personal data does the system process?
const DATA_TYPE_OPTIONS = [
  "Biometric data (face, fingerprint, voice, gait, iris)",
  "Health or medical data",
  "Creditworthiness or financial data",
  "Data revealing racial or ethnic origin",
  "Location or movement data",
  "General behavioural or usage data",
  "No sensitive personal data",
];

// Shown only when "Biometric data" is selected — this single answer changes the entire risk outcome
const BIOMETRIC_TYPE_OPTIONS = [
  {
    value: "verification",
    label: "1-to-1 verification (authentication)",
    detail:
      "Confirms a person is who they claim to be — e.g. face unlock, passport check. Explicitly excluded from the Annex III biometric high-risk classification.",
    icon: Fingerprint,
  },
  {
    value: "identification",
    label: "1-to-many identification",
    detail:
      "Identifies who a person is by comparing against a database — e.g. live face recognition, CCTV search. Classified as high-risk or potentially prohibited under Article 5.",
    icon: Eye,
  },
  {
    value: "categorisation",
    label: "Biometric categorisation",
    detail:
      "Infers sensitive attributes such as race, emotions, sexual orientation, or political opinions from biometric data. Prohibited under Article 5(1)(g).",
    icon: Database,
  },
];

// Interaction and signal characteristics
const SYSTEM_TRAIT_OPTIONS = [
  "Interacts directly with users (chat interface, shown decisions, user-facing output)",
  "Detects or infers emotions, mood, personality, or intent",
  "Operates purely in the background — no direct output to end users",
  "Processes data of EU residents even if operated outside the EU",
];

// Who will deploy or operate the system?
const DEPLOYER_PROFILE_OPTIONS = [
  {
    value: "public_authority",
    label: "Public authority or government body",
    detail:
      "Government agency, public administration, courts, law enforcement, etc. Mandatory Fundamental Rights Impact Assessment (FRIA) under Article 27.",
    icon: Building2,
  },
  {
    value: "private_public_service",
    label: "Private provider of public services",
    detail:
      "Private entity providing essential public services — welfare benefits, public employment, etc. FRIA requirements likely apply under Article 27.",
    icon: Users2,
  },
  {
    value: "private_commercial",
    label: "Private — commercial context",
    detail:
      "Standard commercial business with no public authority function. Standard deployer obligations under Article 26 apply.",
    icon: Briefcase,
  },
  {
    value: "mixed_or_unsure",
    label: "Multiple deployer types or not yet determined",
    detail:
      "System will be sold to different customer types, or the deployer context is not yet fully defined.",
    icon: HelpCircle,
  },
];

// ---------------------------------------------------------------------------
// Description composer
// ---------------------------------------------------------------------------

function composeDescription(answers: WizardAnswers): string {
  const purposeLabel =
    PURPOSE_OPTIONS.find((o) => o.value === answers.purpose)?.label ??
    answers.purpose ??
    "Not specified";

  const automationLabel =
    AUTOMATION_OPTIONS.find((o) => o.value === answers.automation)?.label ??
    answers.automation ??
    "Not specified";

  const deploymentLabel =
    DEPLOYMENT_OPTIONS.find((o) => o.value === answers.deployment)?.label ??
    answers.deployment ??
    "Not specified";

  const roleLabel =
    ROLE_OPTIONS.find((o) => o.value === answers.role)?.label ??
    answers.role ??
    "Not specified";

  const affected =
    answers.affectedPersons.length > 0
      ? answers.affectedPersons.join(", ")
      : "Not specified";

  const sectors =
    answers.sectors.length > 0 ? answers.sectors.join(", ") : "Not specified";

  const dataTypes =
    answers.dataTypes.length > 0
      ? answers.dataTypes.join(", ")
      : "Not specified";

  const biometricLine =
    answers.dataTypes.includes(
      "Biometric data (face, fingerprint, voice, gait, iris)",
    ) && answers.biometricType
      ? `\nBiometric processing type: ${
          BIOMETRIC_TYPE_OPTIONS.find((o) => o.value === answers.biometricType)
            ?.label ?? answers.biometricType
        }.`
      : "";

  const traits =
    answers.systemTraits.length > 0
      ? answers.systemTraits.join(", ")
      : "Not specified";

  const deployerProfileLabel =
    DEPLOYER_PROFILE_OPTIONS.find((o) => o.value === answers.deployerProfile)
      ?.label ??
    answers.deployerProfile ??
    "Not specified";

  return [
    `AI System Purpose: ${purposeLabel}.`,
    `Affected persons: ${affected}.`,
    `Decision-making: ${automationLabel}.`,
    `EU deployment: ${deploymentLabel}.`,
    `My role: ${roleLabel}.`,
    `Operating sector(s): ${sectors}.`,
    `Data processed: ${dataTypes}.${biometricLine}`,
    `System characteristics: ${traits}.`,
    `Operator/deployer profile: ${deployerProfileLabel}.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Step progress bar
// ---------------------------------------------------------------------------

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i < current
              ? "bg-primary w-6"
              : i === current
                ? "bg-primary/50 w-4"
                : "bg-border w-3",
          )}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {current + 1} / {total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option card (single-select)
// ---------------------------------------------------------------------------

function OptionCard({
  label,
  detail,
  Icon,
  selected,
  onClick,
}: {
  label: string;
  detail?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3.5 text-left transition-all duration-150",
        "hover:border-primary/50 hover:bg-primary/5",
        selected
          ? "border-primary bg-primary/8 ring-1 ring-primary"
          : "border-border bg-transparent",
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              selected ? "text-primary" : "text-muted-foreground",
            )}
          />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              selected ? "text-primary" : "text-foreground",
            )}
          >
            {label}
          </p>
          {detail && (
            <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
          )}
        </div>
        {selected && (
          <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Option chip (multi-select)
// ---------------------------------------------------------------------------

function OptionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/5",
      )}
    >
      {selected && <Check className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section label used inside step 6
// ---------------------------------------------------------------------------

function StepSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 8;

export function GuidedWizard({ onComplete, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(INITIAL_ANSWERS);
  const [composedText, setComposedText] = useState("");

  // When reaching the review step (7), compose the description
  useEffect(() => {
    if (step === 7) {
      setComposedText(composeDescription(answers));
    }
  }, [step, answers]);

  // Escape key closes wizard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // When biometric data is deselected, clear the biometric type answer
  useEffect(() => {
    if (
      !answers.dataTypes.includes(
        "Biometric data (face, fingerprint, voice, gait, iris)",
      )
    ) {
      setAnswers((a) => ({ ...a, biometricType: null }));
    }
  }, [answers.dataTypes]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return answers.purpose !== null;
      case 1:
        return answers.affectedPersons.length > 0;
      case 2:
        return answers.automation !== null;
      case 3:
        return answers.deployment !== null;
      case 4:
        return answers.role !== null;
      case 5:
        return answers.sectors.length > 0;
      case 6: {
        const hasDataType = answers.dataTypes.length > 0;
        const hasBiometricType = answers.dataTypes.includes(
          "Biometric data (face, fingerprint, voice, gait, iris)",
        )
          ? answers.biometricType !== null
          : true;
        const hasTrait = answers.systemTraits.length > 0;
        const hasDeployerProfile = answers.deployerProfile !== null;
        return (
          hasDataType && hasBiometricType && hasTrait && hasDeployerProfile
        );
      }
      case 7:
        return composedText.trim().length >= 20;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete(composedText.trim());
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // ---------------------------------------------------------------------------
  // Step titles / subtitles
  // ---------------------------------------------------------------------------

  const STEP_META = [
    {
      title: "What does your AI system do?",
      subtitle: "Select the best description of the system's primary function.",
    },
    {
      title: "Who does it affect?",
      subtitle:
        "Select all groups whose interests or rights your system may impact. Choose at least one.",
    },
    {
      title: "How automated is the decision-making?",
      subtitle:
        "Choose the option that best describes how much human oversight is involved.",
    },
    {
      title: "Where is the system deployed?",
      subtitle:
        "The EU AI Act applies when systems are used in or affect people in the EU.",
    },
    {
      title: "What is your role?",
      subtitle: "This determines which set of obligations applies to you.",
    },
    {
      title: "Which sector does it operate in?",
      subtitle:
        "These map directly to Annex III high-risk categories. Select all that apply.",
    },
    {
      title: "Data, interaction & operator profile",
      subtitle:
        "Four quick questions that determine biometric classification, prohibited practice checks, and FRIA obligations.",
    },
    {
      title: "Review your description",
      subtitle:
        "We\u2019ve composed a structured description from your answers. Edit it before running the analysis.",
    },
  ];

  const meta = STEP_META[step]!;

  // ---------------------------------------------------------------------------
  // Step content renderers
  // ---------------------------------------------------------------------------

  const renderStep = () => {
    switch (step) {
      // Step 1 — Purpose (single-select cards)
      case 0:
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PURPOSE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                detail={opt.detail}
                Icon={opt.icon}
                selected={answers.purpose === opt.value}
                onClick={() =>
                  setAnswers((a) => ({ ...a, purpose: opt.value }))
                }
              />
            ))}
          </div>
        );

      // Step 2 — Affected persons (multi-select chips)
      case 1:
        return (
          <div className="flex flex-wrap gap-2">
            {AFFECTED_OPTIONS.map((opt) => {
              const selected = answers.affectedPersons.includes(opt);
              return (
                <OptionChip
                  key={opt}
                  label={opt}
                  selected={selected}
                  onClick={() =>
                    setAnswers((a) => ({
                      ...a,
                      affectedPersons: selected
                        ? a.affectedPersons.filter((x) => x !== opt)
                        : [...a.affectedPersons, opt],
                    }))
                  }
                />
              );
            })}
          </div>
        );

      // Step 3 — Automation (single-select cards)
      case 2:
        return (
          <div className="grid grid-cols-1 gap-2">
            {AUTOMATION_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                detail={opt.detail}
                selected={answers.automation === opt.value}
                onClick={() =>
                  setAnswers((a) => ({ ...a, automation: opt.value }))
                }
              />
            ))}
          </div>
        );

      // Step 4 — Deployment (single-select cards)
      case 3:
        return (
          <div className="grid grid-cols-1 gap-2">
            {DEPLOYMENT_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                detail={opt.detail}
                Icon={opt.icon}
                selected={answers.deployment === opt.value}
                onClick={() =>
                  setAnswers((a) => ({ ...a, deployment: opt.value }))
                }
              />
            ))}
          </div>
        );

      // Step 5 — Role (single-select cards)
      case 4:
        return (
          <div className="grid grid-cols-1 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                detail={opt.detail}
                Icon={opt.icon}
                selected={answers.role === opt.value}
                onClick={() => setAnswers((a) => ({ ...a, role: opt.value }))}
              />
            ))}
          </div>
        );

      // Step 5 — Sectors (multi-select chips)
      case 5:
        return (
          <div className="flex flex-wrap gap-2">
            {SECTOR_OPTIONS.map((opt) => {
              const selected = answers.sectors.includes(opt);
              return (
                <OptionChip
                  key={opt}
                  label={opt}
                  selected={selected}
                  onClick={() =>
                    setAnswers((a) => ({
                      ...a,
                      sectors: selected
                        ? a.sectors.filter((x) => x !== opt)
                        : [...a.sectors, opt],
                    }))
                  }
                />
              );
            })}
          </div>
        );

      // Step 6 — Data, interaction & operator profile
      case 6:
        return (
          <div className="space-y-7">
            {/* A: Data types */}
            <div>
              <StepSectionLabel>
                <span className="flex items-center gap-1.5">
                  <Database className="inline h-3 w-3" />
                  What personal data does the system process?
                </span>
              </StepSectionLabel>
              <p className="mb-3 text-xs text-muted-foreground">
                Select all that apply. Determines Article 10 data governance
                obligations and whether special-category protections apply.
              </p>
              <div className="flex flex-wrap gap-2">
                {DATA_TYPE_OPTIONS.map((opt) => {
                  const selected = answers.dataTypes.includes(opt);
                  return (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={selected}
                      onClick={() =>
                        setAnswers((a) => ({
                          ...a,
                          dataTypes: selected
                            ? a.dataTypes.filter((x) => x !== opt)
                            : [...a.dataTypes, opt],
                        }))
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* B: Biometric type — conditional on biometric data selection */}
            {answers.dataTypes.includes(
              "Biometric data (face, fingerprint, voice, gait, iris)",
            ) && (
              <div>
                <StepSectionLabel>
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="inline h-3 w-3" />
                    What type of biometric processing?
                  </span>
                </StepSectionLabel>
                <p className="mb-3 text-xs text-muted-foreground">
                  This single distinction changes the entire risk outcome — from
                  excluded, to high-risk, to prohibited.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {BIOMETRIC_TYPE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      detail={opt.detail}
                      Icon={opt.icon}
                      selected={answers.biometricType === opt.value}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, biometricType: opt.value }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* C: System characteristics */}
            <div>
              <StepSectionLabel>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="inline h-3 w-3" />
                  System characteristics
                </span>
              </StepSectionLabel>
              <p className="mb-3 text-xs text-muted-foreground">
                Select all that apply. Determines Article 50 transparency
                obligations and Article 5 prohibited-practice checks.
              </p>
              <div className="flex flex-wrap gap-2">
                {SYSTEM_TRAIT_OPTIONS.map((opt) => {
                  const selected = answers.systemTraits.includes(opt);
                  return (
                    <OptionChip
                      key={opt}
                      label={opt}
                      selected={selected}
                      onClick={() =>
                        setAnswers((a) => ({
                          ...a,
                          systemTraits: selected
                            ? a.systemTraits.filter((x) => x !== opt)
                            : [...a.systemTraits, opt],
                        }))
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* D: Deployer profile */}
            <div>
              <StepSectionLabel>
                <span className="flex items-center gap-1.5">
                  <Building2 className="inline h-3 w-3" />
                  Who will deploy or operate this system?
                </span>
              </StepSectionLabel>
              <p className="mb-3 text-xs text-muted-foreground">
                Determines whether the Fundamental Rights Impact Assessment
                (FRIA) under Article 27 is mandatory for your deployers.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DEPLOYER_PROFILE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    detail={opt.detail}
                    Icon={opt.icon}
                    selected={answers.deployerProfile === opt.value}
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        deployerProfile: opt.value,
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        );

      // Step 7 — Review + edit composed description
      case 7:
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              We&apos;ve composed a structured description from your answers.
              You can edit it to add any additional context before running the
              analysis. More detail produces more accurate results.
            </p>
            <textarea
              value={composedText}
              onChange={(e) => setComposedText(e.target.value)}
              rows={12}
              className={cn(
                "w-full resize-none rounded-lg border bg-background px-3.5 py-3 text-sm shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "border-border",
              )}
            />
            <p
              className={cn(
                "text-right text-xs",
                composedText.length > 4500
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {composedText.length} / 5000
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guided analysis wizard"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto flex w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-2xl",
            "max-h-[90vh]",
          )}
        >
          {/* Modal header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">Guided Wizard</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close wizard"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step header */}
          <div className="shrink-0 border-b border-border px-6 py-4">
            <StepProgress current={step} total={TOTAL_STEPS} />
            <h2 className="mt-3 text-base font-semibold">{meta.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta.subtitle}
            </p>
          </div>

          {/* Step content (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{renderStep()}</div>

          {/* Navigation footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "border border-border text-foreground hover:bg-muted",
                step === 0 && "pointer-events-none opacity-0",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  Use this description
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
