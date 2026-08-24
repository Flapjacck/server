/* Datastore page — Phase 2 stub.
   Shows managed Postgres and Redis instances. Connection strings are partially redacted.
   "Copy" and "Create" actions are disabled; they wire to the real API in Phase 2. */

import { useState } from "react";
import { Plus, Copy, Check, Database } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { mockDatastores } from "../mock/data";
import type { Datastore } from "../types";
import styles from "./DatastorePage.module.css";

/** Track which row's connection string was recently copied */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(id: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return { copied, copy };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className={styles.usageWrapper}>
      <div className={styles.usageBar}>
        <div className={styles.usageFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.usageLabel}>{used.toFixed(1)} / {total} GiB</span>
    </div>
  );
}

export function DatastorePage() {
  const { copied, copy } = useCopy();

  const COLUMNS: Column<Datastore>[] = [
    {
      key: "name",
      label: "Name",
      sortValue: (r) => r.name,
      render: (r) => <span className={styles.dbName}>{r.name}</span>,
    },
    {
      key: "engine",
      label: "Engine",
      sortValue: (r) => r.engine,
      render: (r) => (
        <span className={styles.engine}>
          {r.engine} {r.version}
        </span>
      ),
      width: "130px",
    },
    {
      key: "status",
      label: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge status={r.status} />,
      width: "110px",
    },
    {
      key: "usage",
      label: "Storage",
      sortValue: (r) => r.usedGib,
      render: (r) => <UsageBar used={r.usedGib} total={r.sizeGib} />,
      width: "200px",
    },
    {
      key: "connection",
      label: "Connection",
      render: (r) => (
        <div className={styles.connRow}>
          <code className={styles.connString}>{r.connectionString}</code>
          <button
            className={styles.copyBtn}
            onClick={() => copy(r.id, r.connectionString)}
            title="Copy connection string"
          >
            {copied === r.id ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      key: "created",
      label: "Created",
      sortValue: (r) => r.createdAt,
      render: (r) => <span className={styles.dim}>{formatDate(r.createdAt)}</span>,
      width: "110px",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Datastore</h1>
          <p className={styles.subtitle}>Managed database instances with persistent volumes.</p>
        </div>
        <Button variant="primary" disabled title="Available in Phase 2">
          <Plus size={14} /> New Instance
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Instances"
          description="Postgres and Redis — connection strings are partially redacted until auth is wired"
        />
        {mockDatastores.length === 0 ? (
          <EmptyState
            icon={<Database size={28} />}
            title="No database instances"
            description="Create a Postgres or Redis instance and get a connection string instantly. Available in Phase 2."
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={mockDatastores}
            rowKey={(r) => r.id}
          />
        )}
      </Card>
    </div>
  );
}
