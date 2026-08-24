/* Compute page — Phase 1 stub.
   Displays containers from mock data. Create/start/stop/delete buttons are visible
   but disabled; they will call the real API when Phase 1 is built. */

import { Plus, Play, Square } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { mockContainers } from "../mock/data";
import type { Container } from "../types";
import styles from "./ComputePage.module.css";

function formatBytes(mib: number): string {
  if (mib >= 1024) return `${(mib / 1024).toFixed(1)} GiB`;
  return `${mib} MiB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

const COLUMNS: Column<Container>[] = [
  {
    key: "name",
    label: "Name",
    sortValue: (r) => r.name,
    render: (r) => (
      <span className={styles.containerName}>{r.name}</span>
    ),
  },
  {
    key: "image",
    label: "Image",
    sortValue: (r) => r.image,
    render: (r) => (
      <code className={styles.image}>{r.image}</code>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortValue: (r) => r.status,
    render: (r) => <Badge status={r.status} />,
    width: "100px",
  },
  {
    key: "cpu",
    label: "CPU",
    sortValue: (r) => r.cpuPercent,
    render: (r) => (
      <span className={styles.metric}>
        {r.status === "running" ? `${r.cpuPercent.toFixed(1)}%` : "—"}
      </span>
    ),
    width: "72px",
    align: "right",
  },
  {
    key: "mem",
    label: "Memory",
    sortValue: (r) => r.memUsedMib,
    render: (r) => (
      <span className={styles.metric}>
        {r.status === "running"
          ? `${formatBytes(r.memUsedMib)} / ${formatBytes(r.memLimitMib)}`
          : "—"}
      </span>
    ),
    width: "140px",
    align: "right",
  },
  {
    key: "ports",
    label: "Ports",
    render: (r) => (
      <span className={styles.ports}>
        {r.ports.length > 0 ? r.ports.join(", ") : <span className={styles.dim}>—</span>}
      </span>
    ),
  },
  {
    key: "created",
    label: "Created",
    sortValue: (r) => r.createdAt,
    render: (r) => <span className={styles.dim}>{formatDate(r.createdAt)}</span>,
    width: "110px",
  },
  {
    key: "actions",
    label: "",
    render: (r) => (
      <div className={styles.actions}>
        {r.status === "running" ? (
          <Button size="sm" variant="ghost" disabled title="Stop (Phase 1)">
            <Square size={12} /> Stop
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled title="Start (Phase 1)">
            <Play size={12} /> Start
          </Button>
        )}
      </div>
    ),
    width: "100px",
    align: "right",
  },
];

export function ComputePage() {
  const runningCount = mockContainers.filter((c) => c.status === "running").length;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Compute</h1>
          <p className={styles.subtitle}>Docker containers on this host.</p>
        </div>
        {/* Disabled until Phase 1 */}
        <Button variant="primary" disabled title="Available in Phase 1">
          <Plus size={14} /> New Container
        </Button>
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{mockContainers.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.ok}`}>{runningCount}</span>
          <span className={styles.statLabel}>Running</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{mockContainers.length - runningCount}</span>
          <span className={styles.statLabel}>Stopped</span>
        </div>
      </div>

      {/* Container table */}
      <Card>
        <CardHeader
          title="Containers"
          description={`${mockContainers.length} containers — mock data, Phase 1 will connect live`}
        />
        <DataTable
          columns={COLUMNS}
          rows={mockContainers}
          rowKey={(r) => r.id}
          emptyTitle="No containers"
          emptyDescription="Create a container to get started. Available in Phase 1."
        />
      </Card>
    </div>
  );
}
