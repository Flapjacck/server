# API Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                          │
│                    (Cloudflare Tunnel)                          │
│                  TLS/HTTPS Encryption                           │
│                   DDoS Protection                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ (Encrypted tunnel)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR SERVER/DOCKER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cloudflare Tunnel Container                            │  │
│  │  - Listens for incoming connections                     │  │
│  │  - Routes traffic to Nginx                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ (Internal network)                    │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Nginx Container (Reverse Proxy)                         │  │
│  │                                                          │  │
│  │  - Port 80 (HTTP)                                       │  │
│  │  - Gzip compression                                     │  │
│  │  - Security headers                                     │  │
│  │  - Request logging                                      │  │
│  │  - X-Forwarded-* headers                                │  │
│  │  - Health check endpoint                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ (Internal network, port 3000)         │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express API Container                                  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Request Flow:                                      │ │  │
│  │  │                                                    │ │  │
│  │  │ 1. Nginx receives request                         │ │  │
│  │  │ 2. Forwards to Express on port 3000               │ │  │
│  │  │ 3. Express middleware pipeline:                   │ │  │
│  │  │    - Request logging (Pino)                       │ │  │
│  │  │    - Compression                                  │ │  │
│  │  │    - JSON body parser                             │ │  │
│  │  │    - CORS handler                                 │ │  │
│  │  │    - API Key Authentication (if not /health)      │ │  │
│  │  │ 4. Route handler processes request                │ │  │
│  │  │ 5. Response returned through middleware           │ │  │
│  │  │ 6. Nginx sends to client via Cloudflare           │ │  │
│  │  │                                                    │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  Port: 3000 (internal only)                             │  │
│  │  Process: Node.js with Express                          │  │
│  │  User: nodejs (non-root)                                │  │
│  │  Logging: Pino (JSON in prod, pretty in dev)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
Client
  │
  ├─ HTTPS Request ──────────┐
  │                          │
  │                    ┌─────▼────────────┐
  │                    │  Cloudflare      │
  │                    │  Tunnel          │
  │                    │  (TLS Encryption)│
  │                    └─────┬────────────┘
  │                          │
  │                    HTTP (Internal)
  │                          │
  │                    ┌─────▼──────────────┐
  │                    │  Nginx             │
  │                    │  Reverse Proxy     │
  │                    │  :80               │
  │                    │                    │
  │                    │ • Compress         │
  │                    │ • Log              │
  │                    │ • Proxy headers    │
  │                    └─────┬──────────────┘
  │                          │
  │                    HTTP (Internal)
  │                          │
  │                    ┌─────▼──────────────────┐
  │                    │  Express API           │
  │                    │  :3000 (internal)      │
  │                    │                        │
  │                    │ Middleware Stack:      │
  │                    │ 1. Logger              │
  │                    │ 2. Compression         │
  │                    │ 3. Body Parser         │
  │                    │ 4. CORS                │
  │                    │ 5. API Key Auth        │
  │                    │                        │
  │                    │ Route Handler          │
  │                    │ (GET /health, etc)     │
  │                    └─────┬──────────────────┘
  │                          │
  │              Response (JSON)
  │                          │
  │                    ┌─────▼──────────────┐
  │                    │  Nginx Sends       │
  │                    │  via Tunnel        │
  │                    │  (Compressed)      │
  │                    └─────┬──────────────┘
  │                          │
  └◀─ HTTPS Response ─────────┘
```

## Component Details

### 1. Express Application Structure

```
api/src/
├── index.ts              # Server entry point & graceful shutdown
├── app.ts                # Express app configuration
├── config.ts             # Configuration loading & validation
├── logger.ts             # Pino logging setup
├── types.ts              # TypeScript type definitions
│
├── middleware/
│   └── apiKeyAuth.ts     # API key authentication middleware
│                         # - Validates X-API-Key header
│                         # - Constant-time comparison
│                         # - Bypasses /health endpoint
│
└── routes/
    └── health.ts         # Health check endpoint
                          # - Public accessible (no auth)
                          # - Returns status, version, uptime
```

### 2. Middleware Pipeline

Each request goes through this middleware stack:

```
Request
  │
  ├─→ Trust Proxy (from Nginx)
  │
  ├─→ Request Logging (Pino)
  │   └─ Skip /health endpoint
  │
  ├─→ Compression
  │   └─ gzip responses > 1KB
  │
  ├─→ JSON Parser
  │   └─ Parse application/json
  │
  ├─→ URL Encoded Parser
  │   └─ Parse form data
  │
  ├─→ CORS Handler
  │   └─ Set CORS headers
  │
  ├─→ API Key Authentication
  │   └─ Skip /health
  │   └─ Validate X-API-Key header
  │   └─ Constant-time comparison
  │
  ├─→ Route Handler
  │   ├─ GET /health
  │   ├─ GET /api/status
  │   └─ 404 Not Found
  │
  ├─→ Error Handler
  │   └─ Format and send errors
  │
Response
```

### 3. API Key Authentication Flow

```
Request with X-API-Key header
        │
        ▼
Check if path is /health
        │
    ┌───┴───┐
    │       │
   YES      NO
    │       │
    │  Continue to handler
    │       │
    │       ▼
    │   Extract X-API-Key header
    │       │
    │       ├─ Missing?
    │       │  └─→ 401 Unauthorized
    │       │
    │       ├─ Invalid format?
    │       │  └─→ 401 Unauthorized
    │       │
    │       └─ Validate against API_KEYS
    │          ├─ Use constant-time comparison
    │          │
    │          ├─ Match found?
    │          │  └─→ Continue to handler
    │          │
    │          └─ No match?
    │             └─→ 401 Unauthorized
    │
    └──────→ Allow request without auth
            Continue to handler
```

### 4. Configuration System

```
Environment Variables
        │
        ├─ NODE_ENV (development|production|test)
        ├─ PORT (default: 3000)
        ├─ API_KEYS (comma-separated)
        ├─ LOG_LEVEL (trace|debug|info|warn|error|fatal)
        ├─ CORS_ORIGIN (default: http://localhost)
        └─ CLOUDFLARED_TOKEN (production only)
        │
        ▼
loadConfig()
        │
        ├─ Validate required variables
        ├─ Parse types (e.g., PORT as number)
        ├─ Split API_KEYS by comma
        ├─ Set log level based on NODE_ENV
        │
        ▼
Config object
        │
        └─ Used by app for initialization
```

### 5. Logging System

```
All Requests
        │
        ├─ Create Pino logger instance
        │  └─ Based on NODE_ENV
        │
    ┌───┴─────────────┐
    │                 │
DEVELOPMENT       PRODUCTION
    │                 │
    ▼                 ▼
Pretty printing     JSON format
    │                 │
    ├─ Colors         ├─ Structured
    ├─ Readable       ├─ Machine parseable
    ├─ Formatted      ├─ Easily searchable
    │                 │
    └────┬────────────┘
         │
         ▼
    Output to stdout
    (Docker captures)
```

## Docker Architecture

### Multi-Stage Build

```
Stage 1: Builder
  ├─ FROM node:20-alpine
  ├─ COPY package.json
  ├─ npm ci
  ├─ COPY src/
  ├─ npm run build (TypeScript → JavaScript)
  └─ dist/ files ready

         │
         │ Copy only dist/ and node_modules
         ▼

Stage 2: Runtime
  ├─ FROM node:20-alpine (fresh, minimal base)
  ├─ Create non-root user
  ├─ COPY dist/ from builder
  ├─ COPY node_modules/ from builder
  ├─ Remove build tools
  ├─ Set non-root user
  └─ EXPOSE 3000
      └─ Ready to run
```

### Service Networking

```
┌────────────────────────────────────────┐
│  Docker Compose Network (internal)     │
│                                        │
│  ┌──────────────────┐                  │
│  │ secure-api       │  port 3000       │
│  │ (Express)        │                  │
│  └────────┬─────────┘                  │
│           │                            │
│     ┌─────▼────────┐                   │
│     │ internal     │ (Docker bridge)   │
│     │ network      │                   │
│     └─────┬────────┘                   │
│           │                            │
│  ┌────────▼──────────┐                 │
│  │ secure-nginx      │  port 80        │
│  │ (Nginx)           │  :80 → 80       │
│  └────────┬──────────┘                 │
│           │                            │
│  ┌────────▼──────────────────┐         │
│  │ secure-cloudflare-tunnel  │         │
│  │ (only in --profile prod)  │         │
│  └───────────────────────────┘         │
│                                        │
└────────────────────────────────────────┘
```

## Security Architecture

```
Public Internet Request
        │
        ▼
┌──────────────────────────────┐
│  Cloudflare Tunnel           │ DDoS protection, WAF, encryption
│  ├─ TLS/SSL encryption       │
│  ├─ DDoS mitigation          │
│  ├─ Global CDN               │
│  └─ Certificate management   │
└──────────────┬───────────────┘
               │
        Internal HTTPS tunnel
               │
        ┌──────▼──────────────────┐
        │  Nginx Reverse Proxy    │ Rate limiting, header filtering
        │  ├─ Security headers    │
        │  ├─ X-Frame-Options     │
        │  ├─ X-Content-Type      │
        │  ├─ Request logging     │
        │  └─ Gzip compression    │
        └──────┬───────────────────┘
               │
        Internal network (port 3000)
               │
        ┌──────▼──────────────────┐
        │  Express API            │ API key auth, input validation
        │  ├─ API key auth        │
        │  ├─ Input validation    │
        │  ├─ Error handling      │
        │  ├─ Constant-time comps │
        │  ├─ Structured logging  │
        │  └─ Non-root user       │
        └────────────────────────┘
```

## Data Flow for Authenticated Request

```
1. Client Request
   └─ curl -H "X-API-Key: my-key" https://api.example.com/api/status

2. Cloudflare Tunnel
   └─ Decrypts TLS
   └─ Routes to internal server

3. Nginx
   ├─ Receives HTTP request
   ├─ Logs request
   ├─ Adds headers (X-Real-IP, X-Forwarded-For, etc)
   └─ Proxies to Express

4. Express Middleware
   ├─ Log request (Pino)
   ├─ Decompress (if needed)
   ├─ Parse JSON body
   ├─ Check CORS headers
   └─ Validate API key
      └─ Extract X-API-Key from headers
      └─ Compare with API_KEYS (constant-time)
      └─ If valid, continue
      └─ If invalid, return 401

5. Route Handler
   ├─ Process request for /api/status
   └─ Return JSON response

6. Response Path
   ├─ Express sends JSON response
   ├─ Nginx compresses (gzip)
   ├─ Nginx adds security headers
   ├─ Cloudflare Tunnel encrypts
   ├─ Sends via HTTPS
   └─ Client receives encrypted response

7. Client
   └─ Decrypts and parses JSON response
```

## Error Handling Architecture

```
Request Error
        │
        ├─ Missing API key?
        │  └─→ 401 Unauthorized
        │
        ├─ Invalid API key?
        │  └─→ 401 Unauthorized
        │
        ├─ Route not found?
        │  └─→ 404 Not Found
        │
        ├─ Invalid request body?
        │  └─→ 400 Bad Request
        │
        ├─ Unhandled exception?
        │  └─→ 500 Internal Server Error
        │      (details hidden in production)
        │
        └─→ Error Response JSON
           ├─ error: "Error type"
           ├─ message: "Human readable"
           └─ timestamp: ISO 8601
```

## Deployment Architecture

### Local Development
```
Your Computer
  ├─ Docker Compose
  │  ├─ API container (port 3000)
  │  ├─ Nginx container (port 80)
  │  └─ No Cloudflare Tunnel
  │
  ├─ Access at: http://localhost
  ├─ .env.local with test keys
  └─ Logs visible in terminal
```

### Production
```
Server (VPS/Self-hosted)
  ├─ Docker Compose with --profile prod
  │  ├─ API container (port 3000)
  │  ├─ Nginx container (port 80)
  │  └─ Cloudflare Tunnel container
  │
  ├─ Access at: https://api.yourdomain.com
  ├─ .env.prod with real keys
  ├─ Cloudflare Tunnel handles HTTPS
  ├─ Logs collected by Docker
  └─ Monitoring and alerting configured
```

## Scalability Considerations

### Current Setup (Single Server)

- Suitable for: Small to medium projects
- Expected throughput: 100-1000 req/s per vCPU
- Bottlenecks: Single server capacity

### Future Scaling Options

1. **Vertical Scaling**
   - Larger server (more CPU/RAM)
   - No code changes needed

2. **Horizontal Scaling**
   - Multiple servers
   - Load balancer (Nginx/HAProxy)
   - Database (PostgreSQL)
   - Cache layer (Redis)

3. **Kubernetes Deployment**
   - Containerize (already done)
   - Create Kubernetes manifests
   - Deploy to K8s cluster

## Health Check Strategy

```
Every 30 seconds:

Client (Docker)
        │
        ├─→ GET /health
        │
        ▼
Nginx Health Check
        │
        ├─→ GET /health
        │
        ▼
Express Health Endpoint
        │
        ├─ Check if server is running
        ├─ Return status
        └─ Return uptime
        │
        ▼
Response (200 OK)
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 1234.56
}
```

If health check fails:
- Docker marks service as unhealthy
- Container may be restarted (restart policy)
- Logs can trigger alerts

## Summary

This architecture provides:
- ✅ **Security**: Cloudflare Tunnel, API keys, TLS encryption
- ✅ **Reliability**: Health checks, graceful shutdown
- ✅ **Performance**: Nginx compression, non-blocking I/O
- ✅ **Observability**: Structured logging, monitoring
- ✅ **Maintainability**: Clean separation of concerns
- ✅ **Scalability**: Containerized, can scale horizontally

---

For deployment specifics, see [DEPLOYMENT.md](DEPLOYMENT.md)
For setup instructions, see [GETTING_STARTED.md](GETTING_STARTED.md)
For Cloudflare configuration, see [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)
