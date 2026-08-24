/* Master mock data file — single source of truth for all pages during Phase 0.
   No line limit here by design; all realistic fixture data lives in one place.
   To wire a real API, replace the import in the page with the api/ function. */

import type {
  HealthResponse,
  Service,
  Container,
  Datastore,
  OWSRoute,
  HostMetrics,
  MetricPoint,
} from "../types";

// ─── Health ───────────────────────────────────────────────────────────────────

export const mockHealth: HealthResponse = {
  ok: true,
  service: "ows-api",
  timestamp: new Date().toISOString(),
};

// ─── Services (Status page) ───────────────────────────────────────────────────

export const mockServices: Service[] = [
  {
    id: "ows-api",
    name: "ows-api",
    description: "Express control-plane API",
    status: "online",
    since: "2026-08-23T12:00:00.000Z",
    endpoint: "/health",
  },
  {
    id: "ows-web",
    name: "ows-web",
    description: "React console (nginx)",
    status: "online",
    since: "2026-08-23T12:00:00.000Z",
    endpoint: "/",
  },
  {
    id: "cloudflared",
    name: "cloudflared",
    description: "Cloudflare Tunnel — public ingress",
    status: "online",
    since: "2026-08-23T11:45:00.000Z",
  },
  {
    id: "npm",
    name: "nginx-proxy-manager",
    description: "Nginx Proxy Manager — internal routing",
    status: "online",
    since: "2026-08-23T11:45:00.000Z",
    endpoint: ":81",
  },
];

// ─── Containers (Compute page) ────────────────────────────────────────────────

export const mockContainers: Container[] = [
  {
    id: "c1a2b3d4",
    name: "nginx-proxy",
    image: "nginx:1.27-alpine",
    status: "running",
    cpuPercent: 0.3,
    memUsedMib: 12,
    memLimitMib: 128,
    createdAt: "2026-08-20T09:00:00.000Z",
    ports: ["80:80", "443:443"],
  },
  {
    id: "c2b3c4d5",
    name: "redis-cache",
    image: "redis:7.4-alpine",
    status: "running",
    cpuPercent: 0.8,
    memUsedMib: 24,
    memLimitMib: 256,
    createdAt: "2026-08-20T09:05:00.000Z",
    ports: ["6379:6379"],
  },
  {
    id: "c3d4e5f6",
    name: "postgres-dev",
    image: "postgres:16-alpine",
    status: "running",
    cpuPercent: 1.4,
    memUsedMib: 96,
    memLimitMib: 512,
    createdAt: "2026-08-21T14:30:00.000Z",
    ports: ["5432:5432"],
  },
  {
    id: "c4e5f6a7",
    name: "ows-api",
    image: "ows-api:latest",
    status: "running",
    cpuPercent: 0.6,
    memUsedMib: 48,
    memLimitMib: 256,
    createdAt: "2026-08-23T12:00:00.000Z",
    ports: ["3000:3000"],
  },
  {
    id: "c5f6a7b8",
    name: "ows-web",
    image: "ows-web:latest",
    status: "running",
    cpuPercent: 0.1,
    memUsedMib: 8,
    memLimitMib: 64,
    createdAt: "2026-08-23T12:01:00.000Z",
    ports: ["8080:80"],
  },
  {
    id: "c6a7b8c9",
    name: "cadvisor",
    image: "gcr.io/cadvisor/cadvisor:v0.49.1",
    status: "running",
    cpuPercent: 2.1,
    memUsedMib: 38,
    memLimitMib: 128,
    createdAt: "2026-08-22T08:00:00.000Z",
    ports: ["8081:8080"],
  },
  {
    id: "c7b8c9d0",
    name: "node-app-staging",
    image: "node:22-alpine",
    status: "stopped",
    cpuPercent: 0,
    memUsedMib: 0,
    memLimitMib: 512,
    createdAt: "2026-08-19T16:00:00.000Z",
    ports: [],
  },
];

// ─── Datastores (Datastore page) ─────────────────────────────────────────────

export const mockDatastores: Datastore[] = [
  {
    id: "db1a2b3c",
    name: "postgres-dev",
    engine: "postgres",
    version: "16.4",
    status: "available",
    sizeGib: 10,
    usedGib: 1.2,
    connectionString: "postgresql://ows:••••••••@localhost:5432/dev",
    createdAt: "2026-08-21T14:30:00.000Z",
  },
  {
    id: "db2b3c4d",
    name: "postgres-staging",
    engine: "postgres",
    version: "16.4",
    status: "stopped",
    sizeGib: 20,
    usedGib: 4.7,
    connectionString: "postgresql://ows:••••••••@localhost:5433/staging",
    createdAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "db3c4d5e",
    name: "redis-cache",
    engine: "redis",
    version: "7.4.0",
    status: "available",
    sizeGib: 2,
    usedGib: 0.1,
    connectionString: "redis://:••••••••@localhost:6379",
    createdAt: "2026-08-20T09:05:00.000Z",
  },
];

// ─── Routes (Routes page) ─────────────────────────────────────────────────────

export const mockRoutes: OWSRoute[] = [
  {
    id: "r1a2b3c4",
    hostname: "api.ows.local",
    targetContainer: "ows-api",
    targetPort: 3000,
    status: "active",
    tls: true,
    createdAt: "2026-08-23T12:10:00.000Z",
  },
  {
    id: "r2b3c4d5",
    hostname: "console.ows.local",
    targetContainer: "ows-web",
    targetPort: 80,
    status: "active",
    tls: true,
    createdAt: "2026-08-23T12:12:00.000Z",
  },
  {
    id: "r3c4d5e6",
    hostname: "metrics.ows.local",
    targetContainer: "cadvisor",
    targetPort: 8080,
    status: "active",
    tls: false,
    createdAt: "2026-08-22T08:05:00.000Z",
  },
  {
    id: "r4d5e6f7",
    hostname: "staging.ows.local",
    targetContainer: "node-app-staging",
    targetPort: 3001,
    status: "inactive",
    tls: true,
    createdAt: "2026-08-19T16:10:00.000Z",
  },
];

// ─── Metrics time series (Metrics page) ──────────────────────────────────────

/** Generate a realistic time series with smooth noise for a given base value */
function generateSeries(
  points: number,
  base: number,
  variance: number,
  intervalMs: number = 30_000
): MetricPoint[] {
  const now = Date.now();
  const series: MetricPoint[] = [];
  let current = base;

  for (let i = points - 1; i >= 0; i--) {
    // Brownian-ish motion: small drift + bounded variance
    const drift = (Math.random() - 0.5) * variance * 0.4;
    current = Math.max(0, Math.min(100, current + drift));
    series.push({
      time: new Date(now - i * intervalMs).toISOString(),
      value: parseFloat(current.toFixed(1)),
    });
  }

  return series;
}

export const mockHostMetrics: HostMetrics = {
  cpu: generateSeries(60, 18, 12),
  ram: generateSeries(60, 42, 8),
  cpuCurrent: 18.4,
  ramCurrent: 42.1,
  ramTotalGib: 32,
};
