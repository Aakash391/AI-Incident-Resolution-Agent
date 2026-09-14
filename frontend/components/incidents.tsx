"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { deleteIncident, getIncidents, updateIncident } from "@/lib/api";
import type { Incident, IncidentSeverity } from "@/lib/types";
import {
  PageHeader,
  Button,
  Modal,
  Card,
  LoadBanner,
  ErrorBanner,
  EmptyState,
} from "./ui/primitives";
import { Icon } from "./ui/icons";
import {
  SeverityBadge,
  StatusBadge,
  PhaseBadge,
  VerificationBadge,
  normalizeSeverity,
  normalizeStatus,
  normalizePhase,
} from "./ui/badge";
import { titleize, formatRelative } from "@/lib/format";
import CreateIncidentModal from "./create-incident-modal";

/* ------------------------------------------------------------------ */
/* Modals                                                              */
/* ------------------------------------------------------------------ */

function EditIncidentModal({
  incident,
  onClose,
  onUpdated,
}: {
  incident: Incident;
  onClose: () => void;
  onUpdated: (incident: Incident) => void;
}) {
  const [title, setTitle] = useState(incident.title);
  const [description, setDescription] = useState(incident.description);
  const [severity, setSeverity] = useState(incident.severity ?? "medium");
  const [status, setStatus] = useState(incident.status ?? "open");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateIncident(incident.id, {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        severity,
        status,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update incident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open title="Edit incident" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="form-field resize-y" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="form-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-field">
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">{error}</div>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={submitting} icon="check">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDeleteModal({
  incident,
  onClose,
  onConfirmed,
  busy,
}: {
  incident: Incident;
  onClose: () => void;
  onConfirmed: () => void;
  busy: boolean;
}) {
  return (
    <Modal open title="Delete incident" onClose={onClose}>
      <p className="text-sm text-[var(--text-secondary)]">
        Permanently delete <span className="font-medium text-[var(--text)]">“{incident.title}”</span>?
        This action cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="danger" loading={busy} icon="trash" onClick={onConfirmed}>Delete</Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const SEVERITIES: IncidentSeverity[] = ["critical", "high", "medium", "low"];

export default function Incidents({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Incident | null>(null);
  const [deleting, setDeleting] = useState<Incident | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function load() {
    setLoadState("loading");
    setError(null);
    try {
      setIncidents(await getIncidents());
      setLoadState("success");
    } catch (err) {
      setLoadState("error");
      setError(err instanceof Error ? err.message : "Unable to load incidents");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return incidents.filter((inc) => {
      const haystack = [inc.id, inc.title, inc.description, inc.severity, inc.status, inc.current_phase]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchSearch = !query || haystack.includes(query);
      const matchSeverity = severityFilter === "all" || normalizeSeverity(inc.severity) === severityFilter;
      const matchStatus = statusFilter === "all" || normalizeStatus(inc.status) === statusFilter;
      const matchPhase = phaseFilter === "all" || normalizePhase(inc.current_phase) === phaseFilter;
      return matchSearch && matchSeverity && matchStatus && matchPhase;
    });
  }, [incidents, search, severityFilter, statusFilter, phaseFilter]);

  const hasFilters = search.trim().length > 0 || severityFilter !== "all" || statusFilter !== "all" || phaseFilter !== "all";

  function handleCreated(incident: Incident) {
    setShowCreate(false);
    setIncidents((cur) => [incident, ...cur]);
    // Creating immediately opens the workspace, which auto-investigates.
    onOpen(incident.id);
  }

  function handleUpdated(updated: Incident) {
    setEditing(null);
    setIncidents((cur) => cur.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function handleDeleted() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await deleteIncident(deleting.id);
      setIncidents((cur) => cur.filter((i) => i.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete incident");
      setDeleting(null);
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <PageHeader
          title="Incidents"
          description="Create incidents and drive them through AI investigation."
          actions={
            <Button icon="plus" variant="primary" onClick={() => setShowCreate(true)}>
              New incident
            </Button>
          }
        />

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search incidents</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Icon name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, id…"
              className="form-field pl-9"
            />
          </label>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="form-field lg:w-40" aria-label="Filter by severity">
            <option value="all">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{titleize(s)}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-field lg:w-40" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="form-field lg:w-44" aria-label="Filter by phase">
            <option value="all">All phases</option>
            <option value="intake">Intake</option>
            <option value="investigating">Investigating</option>
            <option value="diagnosing">Diagnosing</option>
            <option value="remediation_pending">Remediation pending</option>
            <option value="remediating">Remediating</option>
            <option value="verifying">Verifying</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loadState === "loading" && <LoadBanner text="Loading incidents…" />}
        {loadState === "error" && <ErrorBanner title="Unable to load incidents" message={error ?? undefined} onRetry={() => void load()} />}

        {loadState === "success" && filtered.length === 0 && (
          <EmptyState
            icon="activity"
            title={hasFilters ? "No incidents match your filters" : "No incidents yet"}
            description={hasFilters ? "Try changing the search or filters." : "Create your first incident to begin the AI resolution workflow."}
            action={!hasFilters ? <Button icon="plus" variant="primary" onClick={() => setShowCreate(true)}>New incident</Button> : undefined}
          />
        )}

        {loadState === "success" && filtered.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
                    {["Incident", "Severity", "Status", "Phase", "Updated", ""].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((inc) => (
                    <tr key={inc.id} className="group transition-colors hover:bg-[var(--surface-subtle)]">
                      <td className="max-w-md px-4 py-3">
                        <button type="button" onClick={() => onOpen(inc.id)} className="block w-full text-left">
                          <div className="truncate text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
                            {inc.title}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{inc.description}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-[var(--text-muted)]">{inc.id}</div>
                        </button>
                      </td>
                      <td className="px-4 py-3"><SeverityBadge value={inc.severity} /></td>
                      <td className="px-4 py-3"><StatusBadge value={inc.status} /></td>
                      <td className="px-4 py-3"><PhaseBadge value={inc.current_phase} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-[var(--text-secondary)]">{formatRelative(inc.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button type="button" onClick={() => onOpen(inc.id)} title="Open investigation" className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--accent)]">
                            <Icon name="spark" size={16} />
                          </button>
                          <button type="button" onClick={() => setEditing(inc)} title="Edit" className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]">
                            <Icon name="edit" size={16} />
                          </button>
                          <button type="button" onClick={() => setDeleting(inc)} title="Delete" className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {showCreate && <CreateIncidentModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {editing && <EditIncidentModal incident={editing} onClose={() => setEditing(null)} onUpdated={handleUpdated} />}
      {deleting && (
        <ConfirmDeleteModal
          incident={deleting}
          busy={deletingBusy}
          onClose={() => setDeleting(null)}
          onConfirmed={() => void handleDeleted()}
        />
      )}
    </section>
  );
}