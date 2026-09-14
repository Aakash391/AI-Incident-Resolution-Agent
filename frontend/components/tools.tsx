"use client";

import { PageHeader, Card, CardHeader, Meter, LiveDot, Skeleton, ErrorBanner } from "./ui/primitives";
import { Icon } from "./ui/icons";
import { useLiveSystem } from "@/lib/use-live";
import { clampPercent } from "@/lib/format";
import type { ToolsHealth, ToolsMetrics } from "@/lib/types";

function HealthCard({ health }: { health: ToolsHealth | null }) {
  if (!health) {
    return (
      <Card>
        <CardHeader icon="server" title="Web health" description="GET /api/v1/tools/health" />
        <div className="space-y-2 p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </Card>
    );
  }

  const healthy = Boolean(health.healthy);
  return (
    <Card>
      <CardHeader
        icon="server"
        title="Web health"
        description="GET /api/v1/tools/health"
        right={<LiveDot className={healthy ? "bg-emerald-500" : "bg-red-500"} />}
      />
      <div className="flex items-center gap-3 p-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
            healthy
              ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400"
          }`}
        >
          {healthy ? "Healthy" : "Degraded"}
        </span>
        <span className="text-sm tabular-nums text-[var(--text-secondary)]">
          HTTP {health.status_code}
        </span>
      </div>
    </Card>
  );
}

function MetricsCard({ metrics }: { metrics: ToolsMetrics | null }) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader icon="cpu" title="System metrics" description="GET /api/v1/tools/metrics" />
        <div className="space-y-3 p-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader icon="cpu" title="System metrics" description="GET /api/v1/tools/metrics" />
      <div className="grid gap-5 p-5">
        <Meter
          label="CPU usage"
          value={clampPercent(Number(metrics.cpu_usage))}
          display={`${metrics.cpu_usage}%`}
          tone={metrics.cpu_usage > 80 ? "red" : metrics.cpu_usage > 60 ? "amber" : "accent"}
        />
        <Meter
          label="Memory usage"
          value={clampPercent(Number(metrics.memory_usage))}
          display={`${metrics.memory_usage}%`}
          tone={metrics.memory_usage > 80 ? "red" : metrics.memory_usage > 60 ? "amber" : "accent"}
        />
        <Meter
          label="DB connections"
          value={clampPercent((Number(metrics.database_connections) / 100) * 100)}
          display={`${metrics.database_connections} conns`}
          tone="green"
        />
      </div>
    </Card>
  );
}

function LogsCard({ logs }: { logs: { logs: string[] } | null }) {
  return (
    <Card>
      <CardHeader
        icon="activity"
        title="Recent logs"
        description="GET /api/v1/tools/logs"
        right={<span className="a11y-live-dot text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">Live</span>}
      />
      {!logs ? (
        <div className="space-y-2 p-5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-3.5 w-full" />
          ))}
        </div>
      ) : logs.logs.length === 0 ? (
        <p className="p-5 text-sm text-[var(--text-muted)]">No logs reported.</p>
      ) : (
        <ul className="max-h-64 divide-y divide-[var(--border)] overflow-y-auto">
          {logs.logs.map((line, index) => (
            <li
              key={`${index}-${line}`}
              className="flex items-start gap-3 px-5 py-2 font-[var(--font-mono)] text-[12px] text-[var(--text-secondary)]"
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <span className="break-all">{line}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function Tools() {
  const live = useLiveSystem(4000);

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <PageHeader
          title="Tools"
          description="Live telemetry from the operational tools the agent invokes."
        />

        {live.error && !live.hydrated && (
          <div className="mb-6">
            <ErrorBanner title="Unable to reach the tools API" message={live.error} />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <HealthCard health={live.health} />
          <MetricsCard metrics={live.metrics} />
        </div>

        <div className="mt-5">
          <LogsCard logs={live.logs} />
        </div>

        {live.error && (
          <p className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Icon name="clock" size={13} /> Reconnecting automatically…
          </p>
        )}
      </div>
    </section>
  );
}