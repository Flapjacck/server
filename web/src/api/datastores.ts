/* Datastores API stubs — Phase 2 (not yet live).
   When Postgres management is implemented, pages swap mock imports for these calls. */

import { apiFetch } from "./client";
import type { Datastore } from "../types";

/** List all managed database instances */
export async function listDatastores(signal?: AbortSignal): Promise<Datastore[]> {
  return apiFetch<Datastore[]>("/api/datastores", { signal });
}

/** Retrieve a single datastore by ID */
export async function getDatastore(id: string): Promise<Datastore> {
  return apiFetch<Datastore>(`/api/datastores/${id}`);
}

/** Delete a datastore and its volume by ID */
export async function deleteDatastore(id: string): Promise<void> {
  await apiFetch<void>(`/api/datastores/${id}`, { method: "DELETE" });
}
