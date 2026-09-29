// API request context with authenticated state
export interface AuthenticatedRequest {
  apiKey?: string;
  isHealthCheck?: boolean;
}

// Health check response
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  uptime: number;
}

// Generic error response
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// Configuration
export interface Config {
  port: number;
  nodeEnv: "development" | "production" | "test";
  apiKeys: string[];
  logLevel: string;
}
