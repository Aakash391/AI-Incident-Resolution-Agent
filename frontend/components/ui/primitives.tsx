"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "./icons";

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-sm",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]",
  subtle:
    "bg-[var(--accent-soft)] text-[var(--accent-ink)] hover:bg-[var(--accent-soft)]/70",
  danger:
    "bg-red-500 text-white hover:bg-red-600 shadow-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: Parameters<typeof Icon>[0]["name"];
  loading?: boolean;
}) {
  const sizes =
    size === "sm"
      ? "px-2.5 py-1.5 text-xs gap-1.5"
      : "px-3.5 py-2 text-sm gap-2";
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizes,
        buttonVariants[variant],
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={14} />
      ) : (
        icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Spinner / dot                                                       */
/* ------------------------------------------------------------------ */

export function Spinner({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={[
        "a11y-spin inline-block shrink-0 rounded-full border-2 border-current border-r-transparent",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function LiveDot({
  className = "bg-emerald-500",
}: {
  className?: string;
}) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={[
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          className,
        ].join(" ")}
      />
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${className}`}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Card / Stat                                                         */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`surface-card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  right,
}: {
  title: string;
  description?: string;
  icon?: Parameters<typeof Icon>[0]["name"];
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon name={icon} size={16} />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "accent",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: Parameters<typeof Icon>[0]["name"];
  accent?: "accent" | "green" | "red" | "amber" | "violet" | "blue";
}) {
  const accents: Record<string, string> = {
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        {icon && (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${accents[accent]}`}
          >
            <Icon name={icon} size={15} />
          </span>
        )}
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-[var(--text)]">
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-[var(--text-muted)]">{hint}</div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--surface-subtle)] ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon = "file",
  title,
  description,
  action,
}: {
  icon?: Parameters<typeof Icon>[0]["name"];
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-muted)]">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`surface-card w-full ${wide ? "max-w-3xl" : "max-w-lg"} p-0 shadow-[var(--shadow-pop)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Code block (playbooks)                                              */
/* ------------------------------------------------------------------ */

export function CodeBlock({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
      {label && (
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
          <Icon name="file" size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-[var(--font-mono)] text-[12px] leading-relaxed text-[var(--text)]">
        {value}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gauge / meter                                                       */
/* ------------------------------------------------------------------ */

export function Meter({
  label,
  value,
  display = `${value}%`,
  tone = "accent",
  sub,
}: {
  label: string;
  value: number;
  display?: string;
  tone?: "accent" | "green" | "amber" | "red";
  sub?: string;
}) {
  const barTones: Record<string, string> = {
    accent: "bg-[var(--accent)]",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums text-[var(--text)]">
          {display}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${barTones[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {sub && (
        <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">
          {sub}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section page header                                                 */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline loader banner                                                 */
/* ------------------------------------------------------------------ */

export function LoadBanner({
  text = "Loading…",
}: {
  text?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      <Spinner size={15} />
      {text}
    </div>
  );
}

export function ErrorBanner({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
        <Icon name="alert" size={16} />
        {title}
      </div>
      {message && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-subtle)]"
        >
          <Icon name="refresh" size={14} />
          Retry
        </button>
      )}
    </div>
  );
}