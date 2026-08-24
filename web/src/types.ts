/* Central type definitions for OWS frontend.
   All interfaces mirror what the real API will return — mock data conforms to these exactly.
   Single-file (not a directory) so TypeScript resolves from "../types" unambiguously. */

// ─── API shared ───────────────────────────────────────────────────────────────

/** Discriminated health state driven by polling */
export type HealthState = "ok" | "down" | "unknown";

/** GET /health response shape */
export interface HealthResponse {
  ok: boolean;
  service: string;
  timestamp: string;
}

// ─── Service registry ────────────────────────────────────────────────────────

/** A named infrastructure service shown on the Status page */
export interface Service {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "degraded" | "unknown";
  /** ISO timestamp of last state change */
  since: string;
  endpoint?: string;
}

// ─── Compute (Phase 1) ───────────────────────────────────────────────────────

export type ContainerStatus = "running" | "stopped" | "restarting" | "exited" | "paused";

/** A Docker container managed by the OWS API */
export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  /** CPU usage percentage (0–100) */
  cpuPercent: number;
  /** RAM used in MiB */
  memUsedMib: number;
  /** RAM limit in MiB */
  memLimitMib: number;
  createdAt: string;
  ports: string[];
}

// ─── Datastore (Phase 2) ─────────────────────────────────────────────────────

export type DatastoreStatus = "available" | "starting" | "stopped" | "error";
export type DatastoreEngine = "postgres" | "redis";

/** A managed database instance */
export interface Datastore {
  id: string;
  name: string;
  engine: DatastoreEngine;
  version: string;
  status: DatastoreStatus;
  /** Allocated volume size in GiB */
  sizeGib: number;
  /** Used volume size in GiB */
  usedGib: number;
  /** Connection string shown to the user — redacted until auth is wired */
  connectionString: string;
  createdAt: string;
}

// ─── Routes (Phase 3) ────────────────────────────────────────────────────────

export type RouteStatus = "active" | "inactive" | "error";

/** A hostname-to-container HTTP route managed via NPM */
export interface OWSRoute {
  id: string;
  hostname: string;
  targetContainer: string;
  targetPort: number;
  status: RouteStatus;
  tls: boolean;
  createdAt: string;
}

// ─── Metrics (Phase 4) ───────────────────────────────────────────────────────

/** A single time-series data point for charts */
export interface MetricPoint {
  time: string;
  value: number;
}

/** Host-level resource metrics */
export interface HostMetrics {
  cpu: MetricPoint[];
  ram: MetricPoint[];
  cpuCurrent: number;
  ramCurrent: number;
  ramTotalGib: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

/** A sidebar navigation entry */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  phase: 0 | 1 | 2 | 3 | 4;
}
