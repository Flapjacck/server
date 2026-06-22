import express from "express";
import { initDb, insertString } from "./db";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/strings", async (req, res) => {
  const { value } = req.body;

  if (typeof value !== "string" || value.trim() === "") {
    res.status(400).json({ error: "value must be a non-empty string" });
    return;
  }

  try {
    const row = await insertString(value);
    res.status(201).json(row);
  } catch (err) {
    console.error("Failed to insert string:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

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
