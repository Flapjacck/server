import type { Request } from "express";

/** Same key extraction as auth, kept separate so rate limit runs after auth. */
export function readApiKeyForRateLimit(req: Request): string | undefined {
    const header = req.header("X-API-Key");
    if (header?.trim()) {
        return header.trim();
    }
    const auth = req.header("Authorization");
    if (auth?.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length).trim();
        if (token) {
            return token;
        }
    }
    return undefined;
}
