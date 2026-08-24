/* Sidebar — fixed left nav with OWS logo, nav items, and a footer link.
   Active item is highlighted with the accent color.
   On mobile it overlays as a drawer; the hamburger toggle is in TopBar. */

import { NavLink } from "react-router-dom";
import {
  Activity,
  Container,
  Database,
  Globe,
  BarChart2,
  X,
} from "lucide-react";
import { NAV_ITEMS, REPO_URL } from "../../constants";
import styles from "./Sidebar.module.css";

const ICON_MAP = {
  Activity,
  Container,
  Database,
  Globe,
  BarChart2,
} as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <span className={styles.logo}>OWS</span>
          <span className={styles.logoSub}>Open Web Services</span>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          <ul role="list" className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ""}`
                    }
                    onClick={onClose}
                  >
                    {Icon && <Icon size={16} strokeWidth={1.75} />}
                    <span>{item.label}</span>
                    {item.phase > 0 && (
                      <span className={styles.phaseBadge}>
                        Phase {item.phase}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <footer className={styles.footer}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            GitHub
          </a>
          <span className={styles.footerDivider}>·</span>
          <span className={styles.footerVersion}>Phase 0</span>
        </footer>
      </aside>
    </>
  );
}
