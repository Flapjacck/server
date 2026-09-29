import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { serverLogger } from "./logger.js";

async function main() {
  try {
    // Load configuration
    const config = getConfig();
    serverLogger.info(
      { port: config.port, env: config.nodeEnv },
      "Starting server with configuration"
    );

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, "0.0.0.0", () => {
      serverLogger.info(
        { port: config.port, url: `http://localhost:${config.port}` },
        "Server started successfully"
      );
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      serverLogger.info({ signal }, "Received shutdown signal, closing gracefully");

      server.close(() => {
        serverLogger.info("Server closed");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        serverLogger.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      serverLogger.fatal({ error: err }, "Uncaught exception");
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason) => {
      serverLogger.fatal({ reason }, "Unhandled rejection");
      process.exit(1);
    });
  } catch (error) {
    serverLogger.fatal({ error }, "Failed to start server");
    process.exit(1);
  }
}

main();
