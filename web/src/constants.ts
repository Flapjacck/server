/* App-wide constants — named values only, never magic numbers or strings in components */

/** Health polling interval in milliseconds */
export const HEALTH_POLL_MS = 15_000;

/** Sidebar navigation items — phase marks which roadmap phase enables each section */
export const NAV_ITEMS = [
  { label: "Status",    path: "/",          icon: "Activity",    phase: 0 },
  { label: "Compute",   path: "/compute",   icon: "Container",   phase: 1 },
  { label: "Datastore", path: "/datastore", icon: "Database",    phase: 2 },
  { label: "Routes",    path: "/routes",    icon: "Globe",       phase: 3 },
  { label: "Metrics",   path: "/metrics",   icon: "BarChart2",   phase: 4 },
] as const;

/** GitHub repo URL — shown in sidebar footer */
export const REPO_URL = "https://github.com/plkel/server";
