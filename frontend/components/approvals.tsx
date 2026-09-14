"use client";

import { useMemo } from "react";
import { useInvestigationStore } from "@/lib/store";
import { PageHeader, Card, EmptyState, Button } from "./ui/primitives";
import { Icon } from "./ui/icons";
import { SourceBadge, RiskBadge } from "./ui/badge";
import { titleize, formatDate } from "@/lib/format";

export default function Approvals({
  onOpenIncidents,
}: {
  onOpenIncidents: () => void;
}) {
  const { approvals } = useInvestigationStore();

  const sorted = useMemo(
    () => [...approvals].sort((a, b) => b.createdAt - a.createdAt),
    [approvals],
  );

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <PageHeader
          title="Pending approvals"
          description="Remediations the agent flagged for human review during investigations."
        />

        {sorted.length === 0 ? (
          <EmptyState
            icon="check"
            title="No pending approvals"
            description="When an investigation flags a remediation as requiring approval, it will appear here for review."
            action={<Button icon="activity" variant="secondary" onClick={onOpenIncidents}>Open Incidents</Button>}
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((a) => (
              <Card key={a.key} className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text)]">{a.remediationAction}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <SourceBadge value={a.source} />
                    <RiskBadge value={a.riskLevel} />
                    <span>· {a.incidentTitle}</span>
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    Status: <span className="font-medium text-[var(--text)]">{titleize(a.status)}</span>
                    {a.requiresApproval && <span className="ml-2 text-amber-600 dark:text-amber-400">● requires approval</span>}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Flagged {formatDate(new Date(a.createdAt).toISOString())}
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icon name="clock" size={18} />
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}