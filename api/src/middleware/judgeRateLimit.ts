import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { readApiKeyForRateLimit } from "./judgeRateLimitKey";

type Bucket = {
    count: number;
    windowStartedAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

/** Per-key in-memory rate limit for judge routes. */
export function judgeRateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = readApiKeyForRateLimit(req);
    if (!key) {
        next();
        return;
    }

    const limit = config.judge.rateLimitPerMin;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStartedAt >= WINDOW_MS) {
        bucket = { count: 0, windowStartedAt: now };
        buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
        const retryAfterSec = Math.ceil((bucket.windowStartedAt + WINDOW_MS - now) / 1000);
        res.setHeader("Retry-After", String(Math.max(retryAfterSec, 1)));
        res.status(429).json({
            ok: false,
            error: "rate_limited",
            message: "Too many judge runs; try again shortly",
        });
        return;
    }

    bucket.count += 1;
    next();
}
