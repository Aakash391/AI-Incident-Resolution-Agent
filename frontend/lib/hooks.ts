"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Runs `load` on mount and then every `intervalMs` until the component
 * unmounts. Optionally skips the automatic timer (call `refresh` manually).
 */
export function usePolling<T>(
  load: () => Promise<T>,
  intervalMs: number,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = async () => {
    try {
      const result = await loadRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    void run().then(() => {
      if (!cancelled) {
        timer = setInterval(() => void run(), intervalMs);
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  const refresh = () => void run();

  return { data, error, loading, refresh };
}