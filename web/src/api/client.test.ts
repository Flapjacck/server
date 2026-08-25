import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

describe("apiFetch", () => {
  it("returns JSON when the response is ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, service: "ows-api" }),
      }),
    );

    const body = await apiFetch<{ ok: boolean; service: string }>("/health");

    expect(body.service).toBe("ows-api");
    expect(fetch).toHaveBeenCalledWith(
      "/health",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("throws ApiError when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        text: async () => "down",
      }),
    );

    await expect(apiFetch("/health")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      message: "down",
    });
    await expect(apiFetch("/health")).rejects.toBeInstanceOf(ApiError);
  });
});
