/* Routes API stubs — Phase 3 (not yet live).
   HTTP routing (hostname → container) will be managed via NPM's API or Caddy. */

import { apiFetch } from "./client";
import type { OWSRoute } from "../types";

/** List all hostname-to-container route mappings */
export async function listRoutes(signal?: AbortSignal): Promise<OWSRoute[]> {
  return apiFetch<OWSRoute[]>("/api/routes", { signal });
}

/** Delete a route by ID */
export async function deleteRoute(id: string): Promise<void> {
  await apiFetch<void>(`/api/routes/${id}`, { method: "DELETE" });
}
