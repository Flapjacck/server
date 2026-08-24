/* AppShell — root layout: sidebar + topbar + scrollable main content outlet.
   Owns the theme and sidebar open/close state so both can share it. */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useTheme } from "../../hooks/useTheme";
import { useHealthPoll } from "../../hooks/useHealthPoll";
import styles from "./AppShell.module.css";

export function AppShell() {
  const { theme, toggle } = useTheme();
  const { state: apiState } = useHealthPoll();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <TopBar
          theme={theme}
          onToggleTheme={toggle}
          apiState={apiState}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
