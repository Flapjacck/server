import express from "express";
import { healthRouter } from "./routes/health";
import { judgeRouter } from "./routes/judge";

const JSON_BODY_LIMIT = "10kb";

/** Express app with the public health probe. */
export function createApp(): express.Express {
    const app = express();

    app.disable("x-powered-by");
    
    // CORS middleware
    app.use((_req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        next();
    });
    
    // Handle preflight requests
    app.options(/.*/, (_req, res) => {
        res.sendStatus(200);
    });

    app.use((_req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "no-referrer");
        next();
    });
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.use("/health", healthRouter);
    app.use("/judge", judgeRouter);

    return app;
}
