import { useState, type FormEvent } from "react";

type Props = {
  disabled: boolean;
  onAdd: (value: string) => Promise<void>;
};

export function AddStringForm({ disabled, onAdd }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "insert failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-form" onSubmit={(event) => void submit(event)}>
      <label>
        <span>new row</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="write a string into postgres"
          disabled={disabled || busy}
          maxLength={4000}
        />
      </label>
      <button type="submit" disabled={disabled || busy || value.trim() === ""}>
        {busy ? "writing…" : "commit"}
      </button>
      {error ? <p className="fault">{error}</p> : null}
    </form>
  );
}
