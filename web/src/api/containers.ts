/* Containers API stubs — Phase 1 (not yet live).
   Functions are typed against the real contract; pages import from mock/data.ts for now.
   When the API is ready: delete the mock import in ComputePage and call these directly. */

import { apiFetch } from "./client";
import type { Container } from "../types";

/** List all containers managed by the OWS API */
export async function listContainers(signal?: AbortSignal): Promise<Container[]> {
  return apiFetch<Container[]>("/api/containers", { signal });
}

/** Start a stopped container by ID */
export async function startContainer(id: string): Promise<void> {
  await apiFetch<void>(`/api/containers/${id}/start`, { method: "POST" });
}

/** Stop a running container by ID */
export async function stopContainer(id: string): Promise<void> {
  await apiFetch<void>(`/api/containers/${id}/stop`, { method: "POST" });
}

/** Delete a container by ID */
export async function deleteContainer(id: string): Promise<void> {
  await apiFetch<void>(`/api/containers/${id}`, { method: "DELETE" });
}
