import express from "express";
import { requireApiKey } from "./middleware/apiKeyAuth";
import { healthRouter } from "./routes/health";
import { stringsRouter } from "./routes/strings";

export function createApp(apiKey: string): express.Express {
    const app = express();

    app.disable("x-powered-by");
    app.use((_req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "no-referrer");
        next();
    });
    app.use(express.json({ limit: "10kb" }));
    app.use("/health", healthRouter);
    app.use("/strings", requireApiKey(apiKey), stringsRouter);

    return app;
}
