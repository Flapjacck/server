/* Skeleton — loading placeholder rows and blocks.
   Used instead of spinners so content area doesn't shift on load. */

import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

/** Single skeleton block (text line, cell, etc.) */
export function Skeleton({ width = "100%", height = "16px", className = "" }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface SkeletonRowsProps {
  rows?: number;
  columns?: number;
}

/** Full table skeleton — renders rows × columns of shimmer cells */
export function SkeletonRows({ rows = 5, columns = 5 }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className={styles.tr}>
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className={styles.td}>
              <Skeleton width={c === 0 ? "80%" : c === columns - 1 ? "50%" : "70%"} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
