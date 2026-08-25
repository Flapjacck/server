import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

const HEALTH_PAYLOAD = {
  ok: true,
  service: "ows-api",
  timestamp: "2026-08-23T18:00:00.000Z",
};

function mockHealthOk(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => HEALTH_PAYLOAD,
    }),
  );
}

function mockHealthDown(): void {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
}

describe("OWS status console", () => {
  it("shows operational when /health returns the ows payload", async () => {
    mockHealthOk();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Operational")).toBeInTheDocument();
    });
    expect(screen.getByText("Responding as ows-api")).toBeInTheDocument();
    expect(screen.getByText(/"service": "ows-api"/)).toBeInTheDocument();
  });

  it("shows unreachable when /health cannot be reached", async () => {
    mockHealthDown();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("API Unreachable")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Unable to reach the control-plane API"),
    ).toBeInTheDocument();
    expect(screen.getByText("API down")).toBeInTheDocument();
  });

  it("navigates to compute and lists mocked containers", async () => {
    mockHealthOk();
    render(<App />);

    fireEvent.click(screen.getByRole("link", { name: /compute/i }));

    expect(screen.getByRole("heading", { name: "Compute" })).toBeInTheDocument();
    expect(screen.getByText("nginx-proxy")).toBeInTheDocument();
    expect(screen.getByText("ows-api")).toBeInTheDocument();
  });
});
