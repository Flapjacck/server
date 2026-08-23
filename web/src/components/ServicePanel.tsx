import type { HealthResponse, HealthState } from "../types";

type ServicePanelProps = {
  health: HealthState;
  payload: HealthResponse | null;
};

function formatTimestamp(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function ServicePanel({ health, payload }: ServicePanelProps) {
  return (
    <section className="well" aria-live="polite">
      <p className="rail-label">registered services</p>
      <article className="service-card">
        <header>
          <h2>ows-api</h2>
          <span className={`chip ${health}`}>{health}</span>
        </header>
        <dl>
          <div>
            <dt>role</dt>
            <dd>control plane</dd>
          </div>
          <div>
            <dt>probe</dt>
            <dd>GET /health</dd>
          </div>
          <div>
            <dt>heard</dt>
            <dd>{payload ? formatTimestamp(payload.timestamp) : "—"}</dd>
          </div>
        </dl>
      </article>
      {health === "down" ? (
        <p className="fault">console cannot reach the api through nginx</p>
      ) : null}
    </section>
  );
}
