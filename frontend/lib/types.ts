/**
 * Types mirror the FastAPI backend schemas exactly.
 *
 * Source of truth for the API shapes is `backend/app/schemas/*`.
 * Keep these in sync with the backend; never invent fields the API
 * does not return.
 */

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type Section =
  | "dashboard"
  | "incidents"
  | "playbooks"
  | "tools"
  | "policies"
  | "approvals";

/* ------------------------------------------------------------------ */
/* Enums (backend `app/models/enums.py`)                               */
/* ------------------------------------------------------------------ */

export type IncidentStatus =
  | "open"
  | "investigating"
  | "in_progress"
  | "resolved"
  | "closed"
  | "unknown";

export type IncidentPhase =
  | "intake"
  | "investigating"
  | "diagnosing"
  | "remediation_pending"
  | "remediating"
  | "verifying"
  | "completed"
  | "unknown";

export type VerificationStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "failed"
  | "unknown";

export type IncidentSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

/* ------------------------------------------------------------------ */
/* Incidents (`schemas/incident.py`)                                   */
/* ------------------------------------------------------------------ */

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  current_phase: string;
  root_cause: string | null;
  resolution: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
};

export type CreateIncidentRequest = {
  title: string;
  description: string;
  severity?: string;
};

export type UpdateIncidentRequest = {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
};

/* ------------------------------------------------------------------ */
/* Investigation (`schemas/agent.py`, `schemas/diagnosis.py`,          */
/* `schemas/remediation.py`)                                           */
/* ------------------------------------------------------------------ */

export type Evidence = {
  source: string;
  observation: string;
};

export type IncidentDiagnosis = {
  summary: string;
  root_cause: string;
  confidence: number;
  severity: string;
  affected_component: string;
  evidence: Evidence[];
  remediation_action: string;
  risk_level: string;
};

export type RemediationSource = "rag" | "generated";

export type RemediationProposal = {
  id: string | null;
  remediation_action: string;
  source: string;
  playbook: string | null;
  target_group: string | null;
  risk_level: string;
  status: string;
  requires_approval: boolean;
};

export type InvestigationResponse = {
  diagnosis: IncidentDiagnosis;
  remediation: RemediationProposal;
};

/* ------------------------------------------------------------------ */
/* Live tool telemetry                                                 */
/* ------------------------------------------------------------------ */

export type ToolsHealth = {
  healthy: boolean;
  status_code: number;
};

export type ToolsMetrics = {
  cpu_usage: number;
  memory_usage: number;
  database_connections: number;
};

export type ToolsLogs = {
  logs: string[];
};

export type AppHealth = {
  status: string;
};

/* ------------------------------------------------------------------ */
/* Derived dashboard aggregates                                        */
/* ------------------------------------------------------------------ */

export type DashboardDerived = {
  total: number;
  open: number;
  investigating: number;
  in_progress: number;
  resolved: number;
  closed: number;
  with_diagnosis: number;
  avg_confidence: number | null;
  by_severity: Record<string, number>;
  by_phase: Record<string, number>;
};

/* ------------------------------------------------------------------ */
/* API errors                                                          */
/* ------------------------------------------------------------------ */

export type ApiError = {
  detail?: string;
  message?: string;
};