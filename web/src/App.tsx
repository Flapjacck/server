/* App root — BrowserRouter with all routes.
   AppShell wraps every page; it owns the sidebar, topbar, theme, and health polling.
   MetricsPage is lazy-loaded since recharts is large (~250 kB); other pages are small. */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { StatusPage } from "./pages/StatusPage";
import { ComputePage } from "./pages/ComputePage";
import { DatastorePage } from "./pages/DatastorePage";
import { RoutesPage } from "./pages/RoutesPage";

// Lazy-load the heavy recharts dependency only when the Metrics page is visited
const MetricsPage = lazy(() =>
  import("./pages/MetricsPage").then((m) => ({ default: m.MetricsPage }))
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<StatusPage />} />
          <Route path="compute" element={<ComputePage />} />
          <Route path="datastore" element={<DatastorePage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route
            path="metrics"
            element={
              <Suspense fallback={null}>
                <MetricsPage />
              </Suspense>
            }
          />
          {/* Catch-all redirects unknown paths back to status */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
