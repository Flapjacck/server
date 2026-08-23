export const OWS_API_SERVICE = "ows-api";

export type HealthResponse = {
    ok: true;
    service: typeof OWS_API_SERVICE;
    timestamp: string;
};
