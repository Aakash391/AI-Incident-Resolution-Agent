"use client";

import { titleize } from "@/lib/format";
import type {
  IncidentPhase,
  IncidentSeverity,
  IncidentStatus,
  RiskLevel,
  VerificationStatus,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Tone ranges (light-first, with dark overrides)                      */
/* ------------------------------------------------------------------ */

const tones = {
  neutral:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-200",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  blue:
    "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-400/20",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-400/20",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/20",
  orange:
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-400/20",
  red:
    "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-400/15 dark:text-red-300 dark:ring-red-400/20",
  cyan:
    "bg-cyan-50 text-cyan-700 ring-cyan-600/15 dark:bg-cyan-400/15 dark:text-cyan-300 dark:ring-cyan-400/20",
  indigo:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/20",
} as const;

type Tone = keyof typeof tones;

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: Tone;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full",
        "px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        tones[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

export function normalizeSeverity(value?: string | null): IncidentSeverity {
  const v = value?.toLowerCase();
  if (v === "critical" || v === "high" || v === "medium" || v === "low") {
    return v;
  }
  return "unknown";
}

const severityTone: Record<IncidentSeverity, Tone> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "blue",
  unknown: "neutral",
};

export function SeverityBadge({
  value,
}: {
  value?: string | null;
}) {
  const normalized = normalizeSeverity(value);
  return (
    <Badge
      label={titleize(normalized)}
      tone={severityTone[normalized]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                            */
/* ------------------------------------------------------------------ */

export function normalizeStatus(value?: string | null): IncidentStatus {
  const v = value?.toLowerCase();
  if (
    v === "open" ||
    v === "investigating" ||
    v === "in_progress" ||
    v === "resolved" ||
    v === "closed"
  ) {
    return v;
  }
  return "unknown";
}

const statusTone: Record<IncidentStatus, Tone> = {
  open: "blue",
  investigating: "violet",
  in_progress: "violet",
  resolved: "green",
  closed: "neutral",
  unknown: "neutral",
};

export function StatusBadge({
  value,
}: {
  value?: string | null;
}) {
  const normalized = normalizeStatus(value);
  return (
    <Badge
      label={titleize(normalized)}
      tone={statusTone[normalized]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Phase                                                             */
/* ------------------------------------------------------------------ */

export function normalizePhase(value?: string | null): IncidentPhase {
  const v = value?.toLowerCase();
  if (
    v === "intake" ||
    v === "investigating" ||
    v === "diagnosing" ||
    v === "remediation_pending" ||
    v === "remediating" ||
    v === "verifying" ||
    v === "completed"
  ) {
    return v;
  }
  return "unknown";
}

const phaseTone: Record<IncidentPhase, Tone> = {
  intake: "neutral",
  investigating: "violet",
  diagnosing: "indigo",
  remediation_pending: "amber",
  remediating: "amber",
  verifying: "cyan",
  completed: "green",
  unknown: "neutral",
};

export function PhaseBadge({
  value,
}: {
  value?: string | null;
}) {
  const normalized = normalizePhase(value);
  return (
    <Badge
      label={titleize(normalized)}
      tone={phaseTone[normalized]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Risk                                                              */
/* ------------------------------------------------------------------ */

export function normalizeRisk(value?: string | null): RiskLevel {
  const v = value?.toLowerCase();
  if (v === "critical" || v === "high" || v === "medium" || v === "low") {
    return v;
  }
  return "unknown";
}

const riskTone: Record<RiskLevel, Tone> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "green",
  unknown: "neutral",
};

export function RiskBadge({
  value,
}: {
  value?: string | null;
}) {
  const normalized = normalizeRisk(value);
  return (
    <Badge
      label={titleize(normalized)}
      tone={riskTone[normalized]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Verification                                                       */
/* ------------------------------------------------------------------ */

export function normalizeVerification(
  value?: string | null,
): VerificationStatus {
  const v = value?.toLowerCase();
  if (
    v === "not_started" ||
    v === "in_progress" ||
    v === "passed" ||
    v === "failed"
  ) {
    return v;
  }
  return "unknown";
}

const verificationTone: Record<VerificationStatus, Tone> = {
  not_started: "neutral",
  in_progress: "cyan",
  passed: "green",
  failed: "red",
  unknown: "neutral",
};

export function VerificationBadge({
  value,
}: {
  value?: string | null;
}) {
  const normalized = normalizeVerification(value);
  return (
    <Badge
      label={titleize(normalized)}
      tone={verificationTone[normalized]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Source (RAG / generated)                                            */
/* ------------------------------------------------------------------ */

export function SourceBadge({
  value,
}: {
  value?: string | null;
}) {
  const v = value?.toLowerCase();
  const isRag = v === "rag";
  return (
    <Badge
      label={isRag ? "Retrieved · RAG" : "Generated"}
      tone={isRag ? "indigo" : "violet"}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Generic                                                             */
/* ------------------------------------------------------------------ */

export function ToneBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return <Badge label={label} tone={tone} />;
}