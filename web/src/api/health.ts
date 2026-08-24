/* Health API — Phase 0.
   GET /health is the only live endpoint right now. */

import { apiFetch } from "./client";
import type { HealthResponse } from "../types";

/** Fetch the API health check. Accepts an AbortSignal for cleanup on unmount. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health", { signal });
}
