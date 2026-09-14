"use client";

import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Incidents from "./incidents";
import Playbooks from "./playbooks";
import Tools from "./tools";
import Policies from "./policies";
import Approvals from "./approvals";
import Workspace from "./workspace";
import { InvestigationStoreProvider } from "@/lib/store";
import { getIncidents } from "@/lib/api";
import type { Section } from "@/lib/types";
import { Icon } from "./ui/icons";

const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Dashboard",
  incidents: "Incidents",
  playbooks: "Playbooks",
  tools: "Tools",
  policies: "Policy & guardrails",
  approvals: "Approvals",
};

function ShellInner({
  initialSection,
  initialIncidentId,
}: {
  initialSection: Section | undefined;
  initialIncidentId: string | undefined;
}) {
  const [activeSection, setActiveSection] = useState<Section>(
    initialSection ?? "dashboard",
  );
  const [workspaceId, setWorkspaceId] = useState<string | null>(
    initialIncidentId ?? null,
  );
  const [incidentsCount, setIncidentsCount] = useState<number>();

  useEffect(() => {
    if (initialIncidentId) {
      setWorkspaceId(initialIncidentId);
      setActiveSection("incidents");
    }
  }, [initialIncidentId]);

  async function refreshIncidentCount() {
    try {
      const list = await getIncidents();
      setIncidentsCount(list.length);
    } catch {
      // Non-fatal — the count badge simply stays hidden on failure.
    }
  }

  useEffect(() => {
    if (!workspaceId) {
      void refreshIncidentCount();
    }
  }, [workspaceId]);

  function openIncident(id: string) {
    setWorkspaceId(id);
    setActiveSection("incidents");
  }

  function closeWorkspace() {
    setWorkspaceId(null);
    void refreshIncidentCount();
  }

  function navigate(section: Section) {
    setActiveSection(section);
    setWorkspaceId(null);
  }

  const showWorkspace = workspaceId !== null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar
        activeSection={showWorkspace ? "incidents" : activeSection}
        onSelect={navigate}
        incidentsCount={incidentsCount}
      />

      <div className="ml-60 flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/70 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
            {showWorkspace ? (
              <>
                <span className="text-[var(--text-muted)]">Incidents</span>
                <span className="text-[var(--text-muted)]">/</span>
                <span className="truncate text-[var(--text)]">Investigation</span>
              </>
            ) : (
              SECTION_TITLES[activeSection]
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Icon name="server" size={13} />
            <span>Backend · localhost:8000</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          {showWorkspace ? (
            <Workspace incidentId={workspaceId} onBack={closeWorkspace} />
          ) : activeSection === "dashboard" ? (
            <Dashboard onOpenIncident={openIncident} />
          ) : activeSection === "incidents" ? (
            <Incidents onOpen={openIncident} />
          ) : activeSection === "playbooks" ? (
            <Playbooks onOpenIncidents={() => navigate("incidents")} />
          ) : activeSection === "tools" ? (
            <Tools />
          ) : activeSection === "policies" ? (
            <Policies />
          ) : (
            <Approvals onOpenIncidents={() => navigate("incidents")} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppShell({
  initialSection,
  initialIncidentId,
}: {
  initialSection?: Section;
  initialIncidentId?: string;
}) {
  return (
    <InvestigationStoreProvider>
      <ShellInner
        initialSection={initialSection}
        initialIncidentId={initialIncidentId}
      />
    </InvestigationStoreProvider>
  );
}