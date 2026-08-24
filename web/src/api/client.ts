/* Base API client.
   Reads VITE_API_BASE_URL at build time; falls back to "" for same-origin nginx proxy.
   All API functions throw ApiError on non-2xx responses. */

/** Typed API error — callers check status to decide how to surface the failure.
   Explicit property assignment avoids parameter-property syntax (erasableSyntaxOnly). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

/** Thin fetch wrapper that attaches base URL, enforces JSON, and throws ApiError on failure */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}
