import { useEffect, useState } from "react";
import { fetchHealth, isAbortError } from "./api";
import { HealthLamp } from "./components/HealthLamp";
import { ServicePanel } from "./components/ServicePanel";
import { HEALTH_POLL_MS } from "./constants";
import type { HealthResponse, HealthState } from "./types";

export default function App() {
  const [health, setHealth] = useState<HealthState>("unknown");
  const [payload, setPayload] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function probe(): Promise<void> {
      try {
        const body = await fetchHealth(controller.signal);
        setPayload(body);
        setHealth("ok");
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setPayload(null);
        setHealth("down");
      }
    }

    void probe();
    const timer = window.setInterval(() => {
      void probe();
    }, HEALTH_POLL_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="chassis">
      <div className="grain" aria-hidden="true" />
      <header className="bezel">
        <div className="brand">
          <span className="rack-id">OWS / RACK 01</span>
          <h1>Open Web Services</h1>
        </div>
        <HealthLamp state={health} />
      </header>
      <div className="bay">
        <aside className="rail">
          <p className="rail-label">plane</p>
          <ul>
            <li>
              <span className="active">status</span>
            </li>
            <li>
              <span>compute</span>
            </li>
            <li>
              <span>datastore</span>
            </li>
            <li>
              <span>routes</span>
            </li>
          </ul>
        </aside>
        <ServicePanel health={health} payload={payload} />
      </div>
    </div>
  );
}
