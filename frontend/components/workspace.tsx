"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getIncident, transitionIncident } from "@/lib/api";
import { useInvestigationStore } from "@/lib/store";
import { useLiveSystem } from "@/lib/use-live";
import type { Incident, InvestigationResponse } from "@/lib/types";
import {
  Card,
  CardHeader,
  PageHeader,
  Button,
  LoadBanner,
  ErrorBanner,
  Meter,
  LiveDot,
  CodeBlock,
} from "./ui/primitives";
import { Icon } from "./ui/icons";
import {
  SeverityBadge,
  StatusBadge,
  PhaseBadge,
  RiskBadge,
  VerificationBadge,
  SourceBadge,
  normalizePhase,
} from "./ui/badge";
import { PhaseStepper } from "./ui/stepper";
import { confidenceToPercent, clampPercent, titleize, formatDate, formatRelative } from "@/lib/format";

/* Allowed phase transitions mirror the backend ALLOWED_TRANSITIONS. */
const NEXT_PHASES: Record<string, string[]> = {
  intake: ["investigating"],
  investigating: ["diagnosing"],
  diagnosing: ["remediation_pending"],
  remediation_pending: ["remediating"],
  remediating: ["verifying"],
  verifying: ["completed", "investigating"],
  completed: [],
};

const INVESTIGATION_STEPS = [
  "Gathering live tool metrics",
  "Diagnosing root cause",
  "Proposing remediation",
  "Retrieving / generating playbook",
];

/* ------------------------------------------------------------------ */
/* Live metrics panel — real telemetry from GET /tools/metrics         */
/* ------------------------------------------------------------------ */

function LiveMetricsPanel() {
  const live = useLiveSystem(4000);
  return (
    <Card>
      <CardHeader
        icon="cpu"
        title="Tool metrics"
        description="Live telemetry during investigation · GET /tools/metrics"
        right={
          <span className="flex items-center gap-1.5 text-xs text-emerald-500">
            <LiveDot className="bg-emerald-500" /> Live
          </span>
        }
      />
      <div className="grid gap-6 p-5 sm:grid-cols-3">
        <Meter label="CPU" value={clampPercent(Number(live.metrics?.cpu_usage))} display={live.metrics ? `${live.metrics.cpu_usage}%` : "—"} tone={Number(live.metrics?.cpu_usage) > 80 ? "red" : Number(live.metrics?.cpu_usage) > 60 ? "amber" : "accent"} />
        <Meter label="Memory" value={clampPercent(Number(live.metrics?.memory_usage))} display={live.metrics ? `${live.metrics.memory_usage}%` : "—"} tone={Number(live.metrics?.memory_usage) > 80 ? "red" : Number(live.metrics?.memory_usage) > 60 ? "amber" : "accent"} />
        <Meter label="DB connections" value={clampPercent(Number(live.metrics?.database_connections))} display={live.metrics ? `${live.metrics.database_connections}` : "—"} tone="green" />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Diagnostic view                                                     */
/* ------------------------------------------------------------------ */

function DiagnosisView({ result }: { result: InvestigationResponse }) {
  const d = result.diagnosis;
  const confidence = confidenceToPercent(d.confidence);
  return (
    <Card>
      <CardHeader icon="spark" title="Diagnosis" description="Produced live by POST /agent/investigate" />
      <div className="p-5">
        <p className="text-[15px] leading-relaxed text-[var(--text)]">{d.summary}</p>

        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Root cause
          </div>
          <p className="mt-1 text-sm text-[var(--text)]">{d.root_cause}</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Severity</span>
            <SeverityBadge value={d.severity} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Risk</span>
            <RiskBadge value={d.risk_level} />
          </div>
          <div className="flex items-center justify-between gap-2 sm:col-span-2">
            <span className="text-xs text-[var(--text-secondary)]">Affected component</span>
            <span className="text-sm font-medium text-[var(--text)]">{d.affected_component}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Confidence</span>
            <span className="text-sm font-semibold tabular-nums text-[var(--text)]">{confidence}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {d.evidence.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Evidence</div>
            <ul className="space-y-2">
              {d.evidence.map((ev, i) => (
                <li key={i} className="rounded-lg border border-[var(--border)] px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {ev.source}
                  </div>
                  <div className="mt-0.5 text-sm text-[var(--text)]">{ev.observation}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Remediation view                                                    */
/* ------------------------------------------------------------------ */

function RemediationView({ result }: { result: InvestigationResponse }) {
  const r = result.remediation;
  return (
    <Card>
      <CardHeader icon="check" title="Remediation" description="Recommended action" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge value={r.source} />
          <RiskBadge value={r.risk_level} />
          {r.requires_approval ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
              Requires approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
              Safe to apply
            </span>
          )}
        </div>

        <p className="mt-4 text-[15px] font-medium text-[var(--text)]">{r.remediation_action}</p>

        <div className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Status</span>
            <span className="font-medium text-[var(--text)]">{titleize(r.status)}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Target group</span>
            <span className="font-medium text-[var(--text)]">{r.target_group ?? "—"}</span>
          </div>
        </div>

        {r.playbook && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">
              Playbook · {r.source === "rag" ? "retrieved from knowledge base" : "generated"}
            </div>
            <CodeBlock value={r.playbook} label={r.source === "rag" ? "retrieved-playbook.yaml" : "generated-playbook.yaml"} />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Investigation runner + staged view                                  */
/* ------------------------------------------------------------------ */

function InvestigationView({
  incident,
  result,
  isRunning,
  onRun,
  runError,
}: {
  incident: Incident;
  result: InvestigationResponse | null;
  isRunning: boolean;
  onRun: (force: boolean) => void;
  runError: string | null;
}) {
  if (isRunning) {
    return (
      <Card>
        <CardHeader
          icon="spark"
          title="Investigation in progress"
          description={`Agent analysing incident ${incident.id}`}
          right={<span className="flex items-center gap-1.5 text-xs text-[var(--accent)]"><span className="a11y-spin inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent" /> Running</span>}
        />
        <div className="p-5">
          <ol className="space-y-3">
            {INVESTIGATION_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${i === 0 ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"}`}
                >
                  {i === 0 ? "•" : i + 1}
                </span>
                <span className={`text-sm ${i === 0 ? "font-medium text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <LiveMetricsPanel />
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            The agent is calling its tools and waiting on the language model — this can take a moment.
          </p>
        </div>
      </Card>
    );
  }

  if (runError && !result) {
    return (
      <Card className="p-5">
        <ErrorBanner title="Investigation failed" message={runError} onRetry={() => onRun(false)} />
      </Card>
    );
  }

  if (result) {
    return (
      <>
        <div className="grid gap-5 lg:grid-cols-2">
          <DiagnosisView result={result} />
          <RemediationView result={result} />
        </div>
        {runError && (
          <p className="mt-3 text-xs text-red-500">{runError}</p>
        )}
      </>
    );
  }

  // Not running and no result yet (e.g. initial state before auto-run fires).
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)]">
          No investigation has run yet for this incident.
        </p>
        <Button icon="spark" variant="primary" onClick={() => onRun(false)}>
          Run AI investigation
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export default function Workspace({
  incidentId,
  onBack,
  onDeleted,
}: {
  incidentId: string;
  onBack: () => void;
  onDeleted?: (id: string) => void;
}) {
  const store = useInvestigationStore();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const autoTriggered = useRef(false);

  const storeKey = `incident:${incidentId}`;
  const result = store.results[storeKey];
  const isRunning = Boolean(store.running[storeKey]);

  async function loadIncident() {
    try {
      setIncident(await getIncident(incidentId));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unable to load incident");
    }
  }

  useEffect(() => {
    void loadIncident();
  }, [incidentId]);

  async function runInvestigation(force: boolean) {
    if (!incident) return;
    setRunError(null);
    try {
      await store.runInvestigation(incident.description, {
        incidentId: incident.id,
        incidentTitle: incident.title,
        force,
      });
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Investigation failed");
    }
  }

  // Auto-investigate once an incident is loaded and there is no satisfying
  // result yet — this is what makes create → investigate seamless.
  useEffect(() => {
    if (!incident) return;
    if (autoTriggered.current) return;
    if (result || isRunning) return;
    autoTriggered.current = true;
    void runInvestigation(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident]);

  async function handleTransition(nextPhase: string) {
    if (!incident) return;
    setTransitionError(null);
    try {
      const updated = await transitionIncident(incident.id, nextPhase);
      setIncident(updated);
    } catch (err) {
      setTransitionError(err instanceof Error ? err.message : "Transition failed");
    }
  }

  const nextPhases = useMemo(
    () => (incident ? NEXT_PHASES[normalizePhase(incident.current_phase)] ?? [] : []),
    [incident],
  );

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
        >
          <Icon name="arrow-left" size={16} /> Back to incidents
        </button>

        {loadError ? (
          <ErrorBanner title="Unable to load incident" message={loadError} onRetry={() => void loadIncident()} />
        ) : !incident ? (
          <LoadBanner text="Loading incident…" />
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-[var(--text)]">
                    {incident.title}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{incident.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge value={incident.severity} />
                  <StatusBadge value={incident.status} />
                  <VerificationBadge value={incident.verification_status} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]">
                <span className="font-mono">{incident.id}</span>
                <span>Created {formatRelative(incident.created_at)}</span>
                <span>Updated {formatDate(incident.updated_at)}</span>
              </div>
            </div>

            {/* Lifecycle */}
            <Card className="mb-6 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--text)]">Lifecycle</div>
                <PhaseBadge value={incident.current_phase} />
              </div>
              <PhaseStepper current={incident.current_phase} />
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Advance phase:</span>
                {nextPhases.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)]">No further transitions.</span>
                ) : (
                  nextPhases.map((phase) => (
                    <Button key={phase} size="sm" variant="subtle" icon="chevron" onClick={() => void handleTransition(phase)}>
                      {titleize(phase)}
                    </Button>
                  ))
                )}
                {transitionError && <span className="text-xs text-red-500">{transitionError}</span>}
              </div>
            </Card>

            {/* Investigation */}
            <InvestigationView
              incident={incident}
              result={result}
              isRunning={isRunning}
              onRun={(force) => void runInvestigation(force)}
              runError={runError}
            />

            {!isRunning && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button icon="refresh" onClick={() => void runInvestigation(true)}>
                  Re-run investigation
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}