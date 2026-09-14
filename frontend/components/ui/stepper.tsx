"use client";

import type { IncidentPhase } from "@/lib/types";
import { normalizePhase } from "./badge";
import { titleize } from "@/lib/format";

export const PHASE_ORDER: IncidentPhase[] = [
  "intake",
  "investigating",
  "diagnosing",
  "remediation_pending",
  "remediating",
  "verifying",
  "completed",
];

function stepIndex(current: IncidentPhase): number {
  const idx = PHASE_ORDER.indexOf(current);
  return idx === -1 ? 0 : idx;
}

/**
 * Renders the incident lifecycle as a horizontal progress path. The
 * dot for the current phase is highlighted and labelled "current";
 * completed steps show a check.
 */
export function PhaseStepper({
  current,
}: {
  current?: string | null;
}) {
  const active = normalizePhase(current);
  const activeIdx = stepIndex(active);

  return (
    <div className="w-full">
      <ol className="flex items-center gap-1" aria-label="Incident lifecycle">
        {PHASE_ORDER.map((phase, idx) => {
          const isCompleted = idx < activeIdx;
          const isActive = idx === activeIdx;
          const isLast = idx === PHASE_ORDER.length - 1;

          let dot = "";
          if (isCompleted) {
            dot = "bg-[var(--accent)] text-white";
          } else if (isActive) {
            dot =
              "bg-white text-[var(--accent)] ring-2 ring-[var(--accent)]";
          } else {
            dot = "bg-[var(--border-strong)] text-transparent";
          }

          return (
            <li
              key={phase}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${dot}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={[
                    "hidden whitespace-nowrap text-[10px] font-medium sm:block",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {titleize(phase)}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 mb-4 h-px flex-1 ${idx < activeIdx ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}