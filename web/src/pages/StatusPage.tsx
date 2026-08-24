/* Status page — Phase 0 home.
   Shows the live API health card, uptime counter, and all service statuses.
   Health data comes from useHealthPoll(); services are mocked until Phase 1 adds a /services endpoint. */

import { CheckCircle2, XCircle, Clock, AlertCircle, Server } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useHealthPoll } from "../hooks/useHealthPoll";
import { mockServices } from "../mock/data";
import styles from "./StatusPage.module.css";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function StatusPage() {
  const { state, payload, lastChecked } = useHealthPoll();

  const StateIcon =
    state === "ok" ? CheckCircle2 : state === "down" ? XCircle : AlertCircle;

  const stateLabel = state === "ok" ? "Operational" : state === "down" ? "API Unreachable" : "Checking…";

  return (
    <div className={styles.page}>
      {/* Page heading */}
      <div className={styles.heading}>
        <h1 className={styles.title}>System Status</h1>
        <p className={styles.subtitle}>Live view of all OWS services on this host.</p>
      </div>

      {/* Health summary card */}
      <Card className={styles.healthCard}>
        <div className={styles.healthInner}>
          <StateIcon
            size={32}
            strokeWidth={1.5}
            className={`${styles.stateIcon} ${styles[state]}`}
          />
          <div className={styles.healthText}>
            <p className={styles.healthStatus}>{stateLabel}</p>
            <p className={styles.healthMeta}>
              {payload
                ? `Responding as ${payload.service}`
                : "Unable to reach the control-plane API"}
            </p>
          </div>
          <div className={styles.healthTimestamp}>
            <Clock size={13} />
            <span>Last checked {formatTimestamp(lastChecked)}</span>
          </div>
        </div>
      </Card>

      {/* Raw API response */}
      {payload && (
        <Card>
          <CardHeader title="API Response" description="Raw payload from GET /health" />
          <div className={styles.codeBlock}>
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </Card>
      )}

      {/* Service list */}
      <Card>
        <CardHeader
          title="Services"
          description="Infrastructure components on this Docker host"
        />
        <div className={styles.serviceList}>
          {mockServices.map((svc) => (
            <div key={svc.id} className={styles.serviceRow}>
              <div className={styles.serviceLeft}>
                <Server size={14} className={styles.serviceIcon} />
                <div>
                  <p className={styles.serviceName}>{svc.name}</p>
                  <p className={styles.serviceDesc}>{svc.description}</p>
                </div>
              </div>
              <div className={styles.serviceRight}>
                {svc.endpoint && (
                  <code className={styles.serviceEndpoint}>{svc.endpoint}</code>
                )}
                <Badge status={svc.status} />
                <span className={styles.serviceSince}>{formatRelative(svc.since)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
