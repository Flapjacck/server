import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("API Key Authentication Middleware", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    // Set test API key in environment
    process.env.API_KEYS = "test-key-123,test-key-456";
    process.env.NODE_ENV = "test";
    app = createApp();
  });

  afterEach(() => {
    delete process.env.API_KEYS;
  });

  describe("Protected Routes", () => {
    it("should reject requests without API key", async () => {
      const response = await request(app).get("/api/status");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("X-API-Key");
    });

    it("should reject requests with invalid API key", async () => {
      const response = await request(app)
        .get("/api/status")
        .set("X-API-Key", "invalid-key");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Invalid API key");
    });

    it("should accept requests with valid API key", async () => {
      const response = await request(app)
        .get("/api/status")
        .set("X-API-Key", "test-key-123");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });

    it("should accept requests with any of multiple valid API keys", async () => {
      const response = await request(app)
        .get("/api/status")
        .set("X-API-Key", "test-key-456");

      expect(response.status).toBe(200);
    });

    it("should validate API keys with case sensitivity", async () => {
      const response = await request(app)
        .get("/api/status")
        .set("X-API-Key", "TEST-KEY-123");

      expect(response.status).toBe(401);
    });
  });

  describe("Health Endpoint Bypass", () => {
    it("should allow health endpoint without API key", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
    });

    it("should allow health endpoint even with invalid key", async () => {
      const response = await request(app)
        .get("/health")
        .set("X-API-Key", "invalid-key");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
    });
  });

  describe("Error Responses", () => {
    it("should return proper error response structure", async () => {
      const response = await request(app).get("/api/status");

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should include valid timestamp in error response", async () => {
      const response = await request(app).get("/api/status");

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });
});
