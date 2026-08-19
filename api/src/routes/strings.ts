import { Router } from "express";
import { insertString, listStrings } from "../db";

export const stringsRouter = Router();

stringsRouter.get("/", async (_req, res) => {
    try {
        const rows = await listStrings();
        res.json(rows);
    } catch (err) {
        console.error("Failed to list strings:", err);
        res.status(500).json({ error: "internal server error" });
    }
});

stringsRouter.post("/", async (req, res) => {
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
