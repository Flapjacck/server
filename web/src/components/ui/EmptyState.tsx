/* EmptyState — teaches the interface when there is nothing to show.
   Never says "nothing here" — always explains what belongs and what to do. */

import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
