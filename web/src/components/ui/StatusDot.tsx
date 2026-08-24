/* StatusDot — colored dot for live health indicators.
   The "ok" pulse animation signals real-time data without being distracting. */

import type { HealthState } from "../../types";
import styles from "./StatusDot.module.css";

interface StatusDotProps {
  state: HealthState;
  /** Show a text label beside the dot */
  label?: string;
  size?: "sm" | "md";
}

export function StatusDot({ state, label, size = "md" }: StatusDotProps) {
  return (
    <span className={`${styles.wrapper} ${styles[size]}`} aria-label={label}>
      <span className={`${styles.dot} ${styles[state]}`} />
      {label !== undefined && (
        <span className={styles.label}>{label}</span>
      )}
    </span>
  );
}
