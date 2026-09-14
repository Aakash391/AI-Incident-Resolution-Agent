/**
 * Small formatting helpers shared across components.
 */

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelative(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

/** "low" -> "Low"; "remediation_pending" -> "Remediation pending". */
export function titleize(value?: string | null): string {
  if (!value) return "Unknown";
  const cleaned = value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();
  if (!cleaned) return "Unknown";
  return cleaned
    .split(" ")
    .map((word) =>
      word
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}

/** 0..1 confidence to a 0..100 integer. */
export function confidenceToPercent(value?: number | null): number {
  if (value == null) return 0;
  return Math.round(Math.min(1, Math.max(0, value)) * 100);
}

export function clampPercent(value?: number | null): number {
  if (value == null) return 0;
  return Math.min(100, Math.max(0, value));
}