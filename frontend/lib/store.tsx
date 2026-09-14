"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { investigate as investigateApi } from "./api";
import type { InvestigationResponse } from "./types";

/** A remediation flagged for review, surfaced under Pending approvals. */
export type PendingApproval = {
  key: string;
  incidentId: string | null;
  incidentTitle: string;
  remediationAction: string;
  riskLevel: string;
  source: string;
  status: string;
  requiresApproval: boolean;
  createdAt: number;
};

/** A playbook produced during an investigation (RAG or generated). */
export type CollectedPlaybook = {
  key: string;
  incidentId: string | null;
  incidentTitle: string;
  remediationAction: string;
  source: string;
  playbook: string;
  targetGroup: string | null;
  riskLevel: string;
  createdAt: number;
};

type RunInvestigationOptions = {
  incidentId?: string | null;
  incidentTitle?: string;
  /** Bypass the result cache and force a fresh agent call. */
  force?: boolean;
};

type InvestigationStoreValue = {
  /** Running investigations keyed by their id/description dedupe key. */
  running: Record<string, boolean>;
  /** Completed investigations, keyed by dedupe key. */
  results: Record<string, InvestigationResponse>;
  playbooks: CollectedPlaybook[];
  approvals: PendingApproval[];
  /** Run an investigation, persisting playbook + approval outcomes. */
  runInvestigation: (
    description: string,
    options?: RunInvestigationOptions,
  ) => Promise<InvestigationResponse>;
};

const InvestigationStoreContext =
  createContext<InvestigationStoreValue | null>(null);

function dedupeKey(incidentId?: string | null, title = "") {
  if (incidentId) return `incident:${incidentId}`;
  return `text:${title}:${title.length}`;
}

export function InvestigationStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<
    Record<string, InvestigationResponse>
  >({});
  const [playbooks, setPlaybooks] = useState<CollectedPlaybook[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const cacheRef = useRef<Record<string, InvestigationResponse>>({});

  const runInvestigation = useCallback(
    async (
      description: string,
      options?: RunInvestigationOptions,
    ) => {
      const key = dedupeKey(options?.incidentId, options?.incidentTitle);
      const force = Boolean(options?.force);

      // Return the cached result unless a re-run was explicitly requested.
      const cached = cacheRef.current[key];
      if (cached && !force) {
        return cached;
      }

      if (running[key]) {
        // Another component is already running it — there is nothing to
        // await here, so re-run to obtain the promise's result below.
        // This branch only guards the running map; actual duplicate calls
        // are prevented by the workspace UI.
      }

      setRunning((cur) => ({ ...cur, [key]: true }));

      try {
        const response = await investigateApi(description);
        cacheRef.current[key] = response;
        setResults((cur) => ({ ...cur, [key]: response }));

        const { remediation, diagnosis } = response;
        const incidentTitle = options?.incidentTitle ?? "Untitled incident";
        const incidentId = options?.incidentId ?? null;
        const createdAt = Date.now();

        // Persist the playbook produced by this investigation (real data).
        if (remediation.playbook) {
          const playbookItem: CollectedPlaybook = {
            key: `${key}:pb:${createdAt}`,
            incidentId,
            incidentTitle,
            remediationAction: remediation.remediation_action,
            source: remediation.source,
            playbook: remediation.playbook,
            targetGroup: remediation.target_group,
            riskLevel: remediation.risk_level,
            createdAt,
          };
          setPlaybooks((cur) =>
            [
              playbookItem,
              ...cur.filter(
                (p) =>
                  !(
                    p.incidentId === playbookItem.incidentId &&
                    p.remediationAction === playbookItem.remediationAction
                  ),
              ),
            ],
          );
        }

        // Surface anything requiring human approval for review.
        if (
          remediation.requires_approval ||
          remediation.status === "approval_required" ||
          remediation.status === "pending"
        ) {
          const approvalItem: PendingApproval = {
            key: `${key}:appr:${createdAt}`,
            incidentId,
            incidentTitle,
            remediationAction: remediation.remediation_action,
            riskLevel: remediation.risk_level,
            source: remediation.source,
            status: remediation.status,
            requiresApproval: remediation.requires_approval,
            createdAt,
          };
          setApprovals((cur) =>
            [
              approvalItem,
              ...cur.filter(
                (a) =>
                  !(
                    a.incidentId === approvalItem.incidentId &&
                    a.remediationAction === approvalItem.remediationAction
                  ),
              ),
            ],
          );
        }

        return response;
      } finally {
        setRunning((cur) => {
          const next = { ...cur };
          delete next[key];
          return next;
        });
      }
    },
    [running],
  );

  const value = useMemo<InvestigationStoreValue>(
    () => ({ running, results, playbooks, approvals, runInvestigation }),
    [running, results, playbooks, approvals, runInvestigation],
  );

  return (
    <InvestigationStoreContext.Provider value={value}>
      {children}
    </InvestigationStoreContext.Provider>
  );
}

export function useInvestigationStore(): InvestigationStoreValue {
  const value = useContext(InvestigationStoreContext);
  if (!value) {
    throw new Error(
      "useInvestigationStore must be used within InvestigationStoreProvider",
    );
  }
  return value;
}