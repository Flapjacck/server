/* TopBar — 48px fixed bar with breadcrumb, API status dot, and theme toggle.
   Also contains the hamburger menu for mobile sidebar. */

import { Sun, Moon, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { StatusDot } from "../ui/StatusDot";
import type { HealthState } from "../../types";
import { NAV_ITEMS } from "../../constants";
import styles from "./TopBar.module.css";

interface TopBarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  apiState: HealthState;
  onMenuOpen: () => void;
}

function usePageTitle(): string {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((n) =>
    n.path === "/" ? pathname === "/" : pathname.startsWith(n.path)
  );
  return item?.label ?? "OWS";
}

export function TopBar({ theme, onToggleTheme, apiState, onMenuOpen }: TopBarProps) {
  const pageTitle = usePageTitle();

  return (
    <header className={styles.bar}>
      {/* Mobile hamburger */}
      <button
        className={styles.menuBtn}
        onClick={onMenuOpen}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <span className={styles.breadcrumbRoot}>OWS</span>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
      </nav>

      {/* Right-side controls */}
      <div className={styles.controls}>
        <StatusDot
          state={apiState}
          label={apiState === "ok" ? "API" : apiState === "down" ? "API down" : "API…"}
          size="sm"
        />
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
        </button>
      </div>
    </header>
  );
}
