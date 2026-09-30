/**
 * Container healthcheck: GET /health on the API port.
 * Used by Dockerfile HEALTHCHECK and docker-compose api.healthcheck.
 */
const http = require("http");

const port = Number(process.env.PORT || 3000);
const timeoutMs = 2500;

const req = http.get(
  { hostname: "127.0.0.1", port, path: "/health", timeout: timeoutMs },
  (res) => {
    res.resume();
    process.exit(res.statusCode === 200 ? 0 : 1);
  }
);

req.on("error", () => process.exit(1));
req.on("timeout", () => {
  req.destroy();
  process.exit(1);
});
