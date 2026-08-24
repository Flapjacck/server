/* Polls GET /health on a fixed interval.
   AbortController ensures the in-flight request is cancelled on unmount/re-render. */

import { useEffect, useState } from "react";
import { fetchHealth } from "../api/health";
import { HEALTH_POLL_MS } from "../constants";
import type { HealthResponse, HealthState } from "../types";

export interface UseHealthPollResult {
  state: HealthState;
  payload: HealthResponse | null;
  /** ISO timestamp of the most recent check attempt */
  lastChecked: string | null;
}

export function useHealthPoll(): UseHealthPollResult {
  const [state, setState] = useState<HealthState>("unknown");
  const [payload, setPayload] = useState<HealthResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function probe(): Promise<void> {
      try {
        const body = await fetchHealth(controller.signal);
        setPayload(body);
        setState("ok");
      } catch (err) {
        // Ignore aborts — component unmounted, not an actual failure
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPayload(null);
        setState("down");
      } finally {
        setLastChecked(new Date().toISOString());
      }
    }

    void probe();
    const timer = window.setInterval(() => { void probe(); }, HEALTH_POLL_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return { state, payload, lastChecked };
}
