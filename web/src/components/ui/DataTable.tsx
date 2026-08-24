/* DataTable — sortable table with skeleton loading and empty state.
   Tables are first-class content in a console; this is the primary data surface. */

import { useState, type ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SkeletonRows } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import styles from "./DataTable.module.css";

export interface Column<T> {
  key: string;
  label: string;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyTitle = "No items",
  emptyDescription = "Nothing has been created yet.",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(colKey: string) {
    if (sortKey === colKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(colKey);
      setSortDir("asc");
    }
  }

  const sorted = (() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th} ${col.sortValue ? styles.sortable : ""}`}
                style={{ width: col.width, textAlign: col.align ?? "left" }}
                onClick={col.sortValue ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === "asc" ? "ascending" : "descending"
                    : undefined
                }
              >
                <span className={styles.thInner}>
                  {col.label}
                  {col.sortValue && (
                    <span className={styles.sortIcon}>
                      {sortKey === col.key && sortDir === "asc" ? (
                        <ChevronUp size={12} />
                      ) : sortKey === col.key ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronDown size={12} strokeOpacity={0.3} />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows rows={5} columns={columns.length} />
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr key={rowKey(row)} className={styles.tr}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={styles.td}
                    style={{ textAlign: col.align ?? "left" }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
