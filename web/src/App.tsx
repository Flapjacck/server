import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  createString,
  fetchHealth,
  fetchStrings,
  getStoredApiKey,
  setStoredApiKey,
} from "./api";
import { AddStringForm } from "./components/AddStringForm";
import { TableView, type Column } from "./components/TableView";
import { TABLES, type StringRow, type TableName } from "./types";

const STRING_COLUMNS: Column<StringRow>[] = [
  { key: "id", label: "id" },
  { key: "value", label: "value" },
  {
    key: "created_at",
    label: "created_at",
    format: (value) => new Date(String(value)).toLocaleString(),
  },
];

export default function App() {
  const [health, setHealth] = useState<"unknown" | "ok" | "down">("unknown");
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [table, setTable] = useState<TableName>("strings");
  const [rows, setRows] = useState<StringRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((body) => setHealth(body.ok ? "ok" : "down"))
      .catch(() => setHealth("down"));
  }, []);

  const load = useCallback(async (key: string) => {
    if (!key) {
      setRows([]);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("loading");
    try {
      const data = await fetchStrings(key);
      setRows(data);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setRows([]);
      setStatus("error");
      if (err instanceof ApiError && err.status === 401) {
        setError("invalid api key");
      } else {
        setError(err instanceof Error ? err.message : "request failed");
      }
    }
  }, []);

  useEffect(() => {
    void load(apiKey);
  }, [apiKey, load]);

  function onKeyChange(value: string) {
    setApiKey(value);
    setStoredApiKey(value);
  }

  async function onAdd(value: string) {
    await createString(apiKey, value);
    await load(apiKey);
  }

  return (
    <div className="chassis">
      <div className="grain" aria-hidden="true" />
      <header className="bezel">
        <div className="brand">
          <span className="rack-id">RACK 01</span>
          <h1>String Bay</h1>
        </div>
        <div className={`lamp ${health}`}>
          <span className="bulb" />
          <span>api {health}</span>
        </div>
      </header>
      <div className="bay">
        <aside className="rail">
          <p className="rail-label">tables</p>
          <ul>
            {TABLES.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  className={table === item.name ? "active" : ""}
                  onClick={() => setTable(item.name)}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="well">
          <label className="key-field">
            <span>x-api-key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => onKeyChange(event.target.value)}
              placeholder="paste key — stored in this tab only"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          {status === "idle" ? <p className="empty">enter api key to open the bay</p> : null}
          {status === "loading" ? <p className="empty">reading bus…</p> : null}
          {status === "error" ? <p className="fault">{error}</p> : null}
          {status === "ready" && table === "strings" ? (
            <>
              <TableView columns={STRING_COLUMNS} rows={rows} rowKey={(row) => row.id} />
              <AddStringForm disabled={!apiKey} onAdd={onAdd} />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
