/* Routes page — Phase 3 stub.
   Shows hostname → container mappings managed via Nginx Proxy Manager.
   Add/delete actions are disabled; they call the NPM API in Phase 3. */

import { Plus, Globe, Lock, Unlock } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { mockRoutes } from "../mock/data";
import type { OWSRoute } from "../types";
import styles from "./RoutesPage.module.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

const COLUMNS: Column<OWSRoute>[] = [
  {
    key: "hostname",
    label: "Hostname",
    sortValue: (r) => r.hostname,
    render: (r) => (
      <div className={styles.hostnameCell}>
        {r.tls ? (
          <Lock size={12} className={styles.tlsIcon} />
        ) : (
          <Unlock size={12} className={styles.tlsIconMuted} />
        )}
        <span className={styles.hostname}>{r.hostname}</span>
      </div>
    ),
  },
  {
    key: "target",
    label: "Target",
    sortValue: (r) => r.targetContainer,
    render: (r) => (
      <span className={styles.target}>
        {r.targetContainer}:{r.targetPort}
      </span>
    ),
  },
  {
    key: "tls",
    label: "TLS",
    sortValue: (r) => (r.tls ? 1 : 0),
    render: (r) => (
      <span className={r.tls ? styles.tlsYes : styles.tlsNo}>
        {r.tls ? "Enabled" : "None"}
      </span>
    ),
    width: "80px",
  },
  {
    key: "status",
    label: "Status",
    sortValue: (r) => r.status,
    render: (r) => <Badge status={r.status} />,
    width: "100px",
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
    render: () => (
      <Button size="sm" variant="destructive" disabled title="Available in Phase 3">
        Delete
      </Button>
    ),
    width: "80px",
    align: "right",
  },
];

export function RoutesPage() {
  const activeCount = mockRoutes.filter((r) => r.status === "active").length;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>Routes</h1>
          <p className={styles.subtitle}>Hostname → container mappings via Nginx Proxy Manager.</p>
        </div>
        <Button variant="primary" disabled title="Available in Phase 3">
          <Plus size={14} /> Add Route
        </Button>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          <span className={styles.summaryValue}>{mockRoutes.length}</span> routes
        </span>
        <span className={styles.summaryDivider}>·</span>
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.ok}`}>{activeCount}</span> active
        </span>
        <span className={styles.summaryDivider}>·</span>
        <span className={styles.summaryItem}>
          <span className={styles.summaryValue}>{mockRoutes.filter((r) => r.tls).length}</span> with TLS
        </span>
      </div>

      <Card>
        <CardHeader
          title="Proxy Hosts"
          description="Manage HTTP routes via NPM — available in Phase 3"
        />
        {mockRoutes.length === 0 ? (
          <EmptyState
            icon={<Globe size={28} />}
            title="No routes configured"
            description="Add a route to point a hostname at a running container. Available in Phase 3."
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={mockRoutes}
            rowKey={(r) => r.id}
          />
        )}
      </Card>
    </div>
  );
}
