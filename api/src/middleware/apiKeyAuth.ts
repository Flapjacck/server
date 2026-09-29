import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

function readApiKey(req: Request): string | undefined {
    const header = req.header("X-API-Key");
    if (header && header.trim().length > 0) {
        return header.trim();
    }

    const auth = req.header("Authorization");
    if (auth?.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length).trim();
        if (token.length > 0) {
            return token;
        }
    }

    return undefined;
}

function keyMatches(candidate: string, expected: string): boolean {
    const a = Buffer.from(candidate, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(a, b);
}

/** Reject requests without a valid judge API key. */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    if (config.judge.apiKeys.length === 0) {
        res.status(503).json({
            ok: false,
            error: "judge_unavailable",
            message: "Judge API is not configured",
        });
        return;
    }

    const provided = readApiKey(req);
    if (!provided) {
        res.status(401).json({ ok: false, error: "unauthorized", message: "Missing API key" });
        return;
    }

    const valid = config.judge.apiKeys.some((expected) => keyMatches(provided, expected));
    if (!valid) {
        res.status(401).json({ ok: false, error: "unauthorized", message: "Invalid API key" });
        return;
    }

    next();
}
