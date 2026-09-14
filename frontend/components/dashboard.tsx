"use client";

import { useEffect, useMemo, useState } from "react";
import { getIncidents } from "@/lib/api";
import type { Incident } from "@/lib/types";
import {
  Card,
  CardHeader,
  PageHeader,
  Button,
  StatCard,
  LoadBanner,
  ErrorBanner,
  EmptyState,
} from "./ui/primitives";
import { Icon } from "./ui/icons";
import { StatusBadge, SeverityBadge } from "./ui/badge";
import { formatRelative } from "@/lib/format";
import CreateIncidentModal from "./create-incident-modal";

/**
 * Static catalog of the tools the AI agent can invoke — name + description
 * only. Mirrors the backend definitions (`backend/app/tools/definitions.py`)
 * and is read-only: the dashboard shows descriptions, not live telemetry,
 * so it makes no network calls to the unreachable tools source.
 */
const TOOL_CATALOG = [
  {
    name: "check_website_health",
    description:
      "Check whether the production website is healthy and return its HTTP status.",
  },
  {
    name: "get_recent_logs",
    description:
      "Retrieve recent application logs from the production environment.",
  },
  {
    name: "get_system_metrics",
    description: "Retrieve CPU, memory and database connection metrics.",
  },
];

/** Incidents flagged for human approval = severe ones. */
function isSevere(value?: string | null): boolean {
  const v = value?.toLowerCase();
  return v === "high" || v === "critical";
}

export default function Dashboard({
  onOpenIncident,
}: {
  onOpenIncident: (id: string) => void;
}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    try {
      setIncidents(await getIncidents());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load incidents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  /** KPI counts derived from the incidents list. */
  const stats = useMemo(() => {
    let open = 0;
    let investigating = 0;
    let resolved = 0;
    let closed = 0;
    for (const inc of incidents) {
      const status = inc.status?.toLowerCase() ?? "";
      if (status === "open") open++;
      if (status === "investigating" || status === "in_progress")
        investigating++;
      if (status === "resolved") resolved++;
      if (status === "closed") closed++;
    }
    return {
      total: incidents.length,
      open,
      investigating,
      resolved,
      closed,
    };
  }, [incidents]);

  /** All incidents, newest first — rendered in a scrollable list. */
  const recent = useMemo(
    () =>
      [...incidents].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [incidents],
  );

  /** Severe (high/critical) incidents pending human approval, newest first. */
  const approvals = useMemo(
    () =>
      incidents
        .filter((inc) => isSevere(inc.severity))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [incidents],
  );

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <PageHeader
          title="Dashboard"
          description="Operational overview from the backend incidents API."
          actions={
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setShowCreate(true)}
            >
              New incident
            </Button>
          }
        />

        {/* KPI counts */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total incidents"
            value={stats.total}
            icon="activity"
            accent="accent"
            hint="All records"
          />
          <StatCard
            label="Open"
            value={stats.open}
            icon="clock"
            accent="blue"
            hint="Awaiting action"
          />
          <StatCard
            label="Investigating"
            value={stats.investigating}
            icon="search"
            accent="violet"
            hint="Agent analysing"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon="check"
            accent="green"
            hint={`${stats.closed} also closed`}
          />
        </div>

        <div className="mt-6 space-y-6">
          {/* Recent incidents — scrollable, with status + severity */}
          <Card>
            <CardHeader
              icon="activity"
              title="Recent incidents"
              description={
                recent.length > 0
                  ? `${recent.length} incident${recent.length === 1 ? "" : "s"} · status and severity`
                  : "Latest records from GET /incidents"
              }
            />
            {loading ? (
              <LoadBanner text="Loading incidents…" />
            ) : error ? (
              <div className="p-5">
                <ErrorBanner
                  title="Unable to load incidents"
                  message={error}
                  onRetry={() => void load()}
                />
              </div>
            ) : recent.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon="activity"
                  title="No incidents yet"
                  description="Create your first incident to begin the AI resolution workflow."
                  action={
                    <Button
                      variant="primary"
                      icon="plus"
                      onClick={() => setShowCreate(true)}
                    >
                      New incident
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="max-h-[380px] divide-y divide-[var(--border)] overflow-y-auto">
                {recent.map((inc) => (
                  <li key={inc.id}>
                    <button
                      type="button"
                      onClick={() => onOpenIncident(inc.id)}
                      className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
                          {inc.title}
                        </div>
                        <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
                          {inc.description}
                        </div>
                      </div>
                      <StatusBadge value={inc.status} />
                      <SeverityBadge value={inc.severity} />
                      <span className="whitespace-nowrap text-xs tabular-nums text-[var(--text-muted)]">
                        {formatRelative(inc.created_at)}
                      </span>
                      <span className="text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                        <Icon name="chevron" size={16} className="rotate-[-90deg]" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Tools — descriptions only */}
          <Card>
            <CardHeader
              icon="tool"
              title="Tools"
              description="Descriptions of the tools the AI agent can invoke."
            />
            <div className="divide-y divide-[var(--border)]">
              {TOOL_CATALOG.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-start gap-4 px-5 py-3.5"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon name="tool" size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-[var(--font-mono)] text-[13px] font-medium text-[var(--text)]">
                      {tool.name}
                    </div>
                    <div className="mt-0.5 text-sm text-[var(--text-secondary)]">
                      {tool.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Approvals — severe incidents */}
          <Card>
            <CardHeader
              icon="shield"
              title="Severe incident approvals"
              description="High and critical incidents flagged for human approval."
              right={
                approvals.length > 0 ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {approvals.length} pending
                  </span>
                ) : undefined
              }
            />
            {approvals.length === 0 ? (
              <div className="p-5">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] px-6 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon name="check" size={20} />
                  </span>
                  <p className="mt-3 text-sm font-medium text-[var(--text)]">
                    No severe incidents awaiting approval
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    High and critical incidents will appear here for review.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {approvals.map((inc) => (
                  <li key={inc.id}>
                    <button
                      type="button"
                      onClick={() => onOpenIncident(inc.id)}
                      className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                        <Icon name="alert" size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
                          {inc.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                          <Icon name="clock" size={12} />
                          Requires approval
                          <span className="text-[var(--text-muted)]">
                            · {formatRelative(inc.created_at)}
                          </span>
                        </div>
                      </div>
                      <SeverityBadge value={inc.severity} />
                      <StatusBadge value={inc.status} />
                      <span className="text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                        <Icon name="chevron" size={16} className="rotate-[-90deg]" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {showCreate && (
        <CreateIncidentModal
          onClose={() => setShowCreate(false)}
          onCreated={(incident) => {
            setShowCreate(false);
            onOpenIncident(incident.id);
          }}
        />
      )}
    </section>
  );
}