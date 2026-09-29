import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("Health Endpoint", () => {
  const app = createApp();

  it("should return health status without authentication", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body.status).toBe("ok");
  });

  it("should have valid timestamp format", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });

  it("should have uptime as a number", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(typeof response.body.uptime).toBe("number");
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
