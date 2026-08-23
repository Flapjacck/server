import { Router } from "express";
import { OWS_API_SERVICE, type HealthResponse } from "../types";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
    const body: HealthResponse = {
        ok: true,
        service: OWS_API_SERVICE,
        timestamp: new Date().toISOString(),
    };

    res.json(body);
});
