import type { StringRow } from "./types";

const KEY_STORAGE = "homelab-api-key";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getStoredApiKey(): string {
  return sessionStorage.getItem(KEY_STORAGE) ?? "";
}

export function setStoredApiKey(key: string): void {
  if (key) {
    sessionStorage.setItem(KEY_STORAGE, key);
  } else {
    sessionStorage.removeItem(KEY_STORAGE);
  }
}

async function request<T>(path: string, init: RequestInit & { apiKey?: string } = {}): Promise<T> {
  const { apiKey, ...rest } = init;
  const headers = new Headers(rest.headers);

  if (apiKey) {
    headers.set("x-api-key", apiKey);
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...rest, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      /* ignore non-json */
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export function fetchHealth(): Promise<{ ok: boolean }> {
  return request("/health");
}

export function fetchStrings(apiKey: string): Promise<StringRow[]> {
  return request("/strings", { apiKey });
}

export function createString(apiKey: string, value: string): Promise<StringRow> {
  return request("/strings", {
    apiKey,
    method: "POST",
    body: JSON.stringify({ value }),
  });
}
