import express from "express";
import { healthRouter } from "./routes/health";

const JSON_BODY_LIMIT = "10kb";

/** Express app with the public health probe. */
export function createApp(): express.Express {
    const app = express();

    app.disable("x-powered-by");
    app.use((_req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "no-referrer");
        next();
    });
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.use("/health", healthRouter);

    return app;
}
