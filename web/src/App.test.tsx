import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { OWS_API_SERVICE } from "./types";

function mockHealthOk(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        service: OWS_API_SERVICE,
        timestamp: "2026-08-23T18:00:00.000Z",
      }),
    }),
  );
}

function mockHealthDown(): void {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("OWS status console", () => {
  it("shows api ok when /health returns the ows payload", async () => {
    mockHealthOk();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("api ok")).toBeInTheDocument();
    });
    expect(screen.getByText("control plane")).toBeInTheDocument();
  });

  it("shows api down when /health cannot be reached", async () => {
    mockHealthDown();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("api down")).toBeInTheDocument();
    });
    expect(
      screen.getByText("console cannot reach the api through nginx"),
    ).toBeInTheDocument();
  });
});
