"use client";

import { PageHeader, Card, EmptyState } from "./ui/primitives";
import { Icon } from "./ui/icons";

/**
 * Policy definitions are not exposed by the backend API, so this section
 * deliberately shows a real empty state rather than fabricated policy
 * content. It documents the policies that every remediation is subject to.
 */
export default function Policies() {
  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        <PageHeader
          title="Policy & guardrails"
          description="The rules the resolution agent applies before acting."
        />

        <div className="mb-6">
          <EmptyState
            icon="shield"
            title="No policy API is exposed yet"
            description="The backend does not currently expose a policy-definition endpoint. Every remediation from an investigation is instead gated by a live requires-approval flag, visible in the incident workspace and on the Approvals page."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "check" as const,
              title: "Approval gating",
              body: "High-risk remediations carry requires-approval and are surfaced for review before any action.",
            },
            {
              icon: "file" as const,
              title: "Playbook provenance",
              body: "Each playbook is labelled as retrieved from the knowledge base (RAG) or generated for the incident.",
            },
            {
              icon: "target" as const,
              title: "Lifecycle ordering",
              body: "Incidents advance through the validated phase graph — no steps are skipped out of order.",
            },
          ].map((p) => (
            <Card key={p.title + p.body} className="p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name={p.icon} size={16} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}