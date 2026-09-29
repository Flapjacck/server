import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/config";

describe("Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear cached config before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("loadConfig", () => {
    it("should load default configuration", () => {
      process.env.NODE_ENV = "test";
      process.env.API_KEYS = "test-key";

      const config = loadConfig();

      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe("test");
      expect(config.apiKeys).toContain("test-key");
    });

    it("should parse port from environment variable", () => {
      process.env.PORT = "8080";
      process.env.NODE_ENV = "test";
      process.env.API_KEYS = "test-key";

      const config = loadConfig();

      expect(config.port).toBe(8080);
    });

    it("should parse multiple API keys", () => {
      process.env.API_KEYS = "key1,key2,key3";
      process.env.NODE_ENV = "test";

      const config = loadConfig();

      expect(config.apiKeys).toEqual(["key1", "key2", "key3"]);
      expect(config.apiKeys.length).toBe(3);
    });

    it("should trim whitespace from API keys", () => {
      process.env.API_KEYS = "key1 , key2 , key3";
      process.env.NODE_ENV = "test";

      const config = loadConfig();

      expect(config.apiKeys).toEqual(["key1", "key2", "key3"]);
    });

    it("should throw error on invalid port", () => {
      process.env.PORT = "invalid";
      process.env.API_KEYS = "test-key";

      expect(() => loadConfig()).toThrow("Invalid PORT");
    });

    it("should throw error on port out of range", () => {
      process.env.PORT = "99999";
      process.env.API_KEYS = "test-key";

      expect(() => loadConfig()).toThrow("Invalid PORT");
    });

    it("should require API_KEYS in non-test environment", () => {
      delete process.env.API_KEYS;
      process.env.NODE_ENV = "production";

      expect(() => loadConfig()).toThrow("API_KEYS environment variable is required");
    });

    it("should allow empty API_KEYS in test environment", () => {
      delete process.env.API_KEYS;
      process.env.NODE_ENV = "test";

      const config = loadConfig();

      expect(config.apiKeys).toEqual([]);
    });

    it("should set log level based on environment", () => {
      process.env.NODE_ENV = "production";
      process.env.API_KEYS = "test-key";

      const config = loadConfig();

      expect(config.logLevel).toBe("info");
    });

    it("should set debug log level in development", () => {
      process.env.NODE_ENV = "development";
      process.env.API_KEYS = "test-key";

      const config = loadConfig();

      expect(config.logLevel).toBe("debug");
    });

    it("should allow custom log level override", () => {
      process.env.NODE_ENV = "test";
      process.env.API_KEYS = "test-key";
      process.env.LOG_LEVEL = "trace";

      const config = loadConfig();

      expect(config.logLevel).toBe("trace");
    });
  });
});
