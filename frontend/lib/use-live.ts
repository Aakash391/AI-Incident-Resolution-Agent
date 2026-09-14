"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToolsHealth, getToolsLogs, getToolsMetrics } from "./api";
import type { ToolsHealth, ToolsLogs, ToolsMetrics } from "./types";

export type LiveSystem = {
  health: ToolsHealth | null;
  metrics: ToolsMetrics | null;
  logs: ToolsLogs | null;
  error: string | null;
  loading: boolean;
  /** True once at least one payload has loaded successfully. */
  hydrated: boolean;
  /** True when we hold a successfully-loaded payload with no error. */
  available: boolean;
  refresh: () => Promise<void>;
};

/**
 * Fetches the three live tool telemetry endpoints in parallel and
 * re-polls every `intervalMs`. Each call is a real backend request; no
 * values are synthesised on the client.
 */
export function useLiveSystem(
  intervalMs = 5000,
  enabled = true,
): LiveSystem {
  const [health, setHealth] = useState<ToolsHealth | null>(null);
  const [metrics, setMetrics] = useState<ToolsMetrics | null>(null);
  const [logs, setLogs] = useState<ToolsLogs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [h, m, l] = await Promise.all([
        getToolsHealth(),
        getToolsMetrics(),
        getToolsLogs(),
      ]);
      setHealth(h);
      setMetrics(m);
      setLogs(l);
      setError(null);
      setHydrated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    void refresh().then(() => {
      if (!cancelled) {
        timerRef.current = setInterval(() => void refresh(), intervalMs);
      }
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  const anyData = Boolean(health || metrics || logs);

  return {
    health,
    metrics,
    logs,
    error,
    loading,
    hydrated,
    available: anyData && !error,
    refresh,
  };
}