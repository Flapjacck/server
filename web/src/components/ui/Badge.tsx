/* Status badge — semantic colors only, no decoration.
   Accent (#BF1A2F) is reserved for error state via CSS var; never applied directly. */

import type { ContainerStatus, DatastoreStatus, RouteStatus } from "../../types";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "online"
  | "offline"
  | "degraded"
  | "unknown"
  | "running"
  | "stopped"
  | "restarting"
  | "exited"
  | "paused"
  | "available"
  | "starting"
  | "error"
  | "active"
  | "inactive"
  | "pending";

interface BadgeProps {
  status: ContainerStatus | DatastoreStatus | RouteStatus | string;
  label?: string;
}

/** Visual status indicator — solid pill with semantic background */
export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status as string] ?? styles.unknown}`}>
      {label ?? status}
    </span>
  );
}
