"use client";

import type { Section } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { Icon, type IconName } from "./ui/icons";

type NavItem = {
  section: Section;
  label: string;
  icon: IconName;
};

const primary: NavItem[] = [
  { section: "dashboard", label: "Dashboard", icon: "dashboard" },
  { section: "incidents", label: "Incidents", icon: "activity" },
  { section: "playbooks", label: "Playbooks", icon: "playbook" },
  { section: "tools", label: "Tools", icon: "tool" },
];

const governance: NavItem[] = [
  { section: "policies", label: "Policy", icon: "shield" },
  { section: "approvals", label: "Approvals", icon: "check" },
];

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect: (section: Section) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.section)}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]",
      ].join(" ")}
    >
      <Icon
        name={item.icon}
        size={17}
        className={active ? "" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"}
      />
      <span>{item.label}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {children}
    </div>
  );
}

export default function Sidebar({
  activeSection,
  onSelect,
  incidentsCount,
}: {
  activeSection: Section;
  onSelect: (section: Section) => void;
  incidentsCount?: number;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white shadow-sm">
          AI
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-[var(--text)]">
            Incident Resolution
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            AI Investigation Agent
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6">
          <SectionLabel>Operations</SectionLabel>
          <div className="space-y-0.5">
            {primary.map((item) => (
              <div key={item.section} className="relative">
                <NavButton
                  item={item}
                  active={activeSection === item.section}
                  onSelect={onSelect}
                />
                {item.section === "incidents" &&
                  typeof incidentsCount === "number" &&
                  incidentsCount > 0 && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                        activeSection === "incidents"
                          ? "bg-[var(--accent)]/15 text-[var(--accent-ink)]"
                          : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                      }`}
                    >
                      {incidentsCount}
                    </span>
                  )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Governance</SectionLabel>
          <div className="space-y-0.5">
            {governance.map((item) => (
              <NavButton
                key={item.section}
                item={item}
                active={activeSection === item.section}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"
        >
          <Icon
            name={theme === "dark" ? "sun" : "moon"}
            size={17}
            className="text-[var(--text-muted)]"
          />
          <span>{theme === "dark" ? "Switch to light" : "Switch to dark"}</span>
        </button>
      </div>
    </aside>
  );
}