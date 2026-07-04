import { initDb } from "./db";
import { createApp } from "./app";
import { config } from "./config";

const app = createApp(config.apiKey);
const port = config.port;

async function main() {
  await initDb();

  app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
