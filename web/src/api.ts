import { OWS_API_SERVICE, type HealthResponse } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** True when fetch was cancelled because the console unmounted. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    body.ok === true &&
    body.service === OWS_API_SERVICE &&
    typeof body.timestamp === "string"
  );
}

/** Load /health and reject anything that is not the OWS payload. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/health", { signal });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  const body: unknown = await response.json();

  if (!isHealthResponse(body)) {
    throw new ApiError(response.status, "invalid health payload");
  }

  return body;
}
