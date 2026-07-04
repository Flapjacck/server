import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const API_KEY_HEADER = "x-api-key";

function matchesApiKey(providedKey: string, expectedKey: string): boolean {
    const provided = Buffer.from(providedKey);
    const expected = Buffer.from(expectedKey);

    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

export function requireApiKey(expectedKey: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const providedKey = req.header(API_KEY_HEADER)?.trim();

        if (!providedKey || !matchesApiKey(providedKey, expectedKey)) {
            res.status(401).json({ error: "missing or invalid api key" });
            return;
        }

        next();
    };
}
