# Code Roulette API

A lightweight, secure backend API built for the **Code Roulette** club event. Let teams submit their code and get instant feedback without revealing the test files. Built with Express, TypeScript, and Cloudflare Tunnel for free public hosting.

[![Express 4.18](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)](https://expressjs.com) [![TypeScript 5.3](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org) [![Node.js 20](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org) [![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com) [![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?style=flat-square&logo=nginx)](https://nginx.org) [![Cloudflare Tunnel](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?style=flat-square&logo=cloudflare)](https://www.cloudflare.com) [![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev)

## Why I Built This

Instead of a janky Google Form or paying for hosting, I:
1. Built a secure API that validates code without exposing tests
2. Set up a **Cloudflare Tunnel** so it's publicly accessible for free
3. Locked it down with API key auth (one per team)
4. Deployed on my own server — zero hosting costs

This API lets teams test their solutions instantly during the event. Simple, effective, and scalable.

## Quick Start — Local Development

### Prerequisites
- Docker and Docker Compose
- ~2GB free disk space
- Port 80 available

### Start Services (5 minutes)

```bash
cd server
docker compose up
```

Wait for the "Server started successfully" message, then in another terminal:

```bash
# Health check (no auth required)
curl http://localhost/health

# Test protected endpoint (use test key)
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status
```

Expected responses:
```json
// GET /health
{
  "status": "ok",
  "timestamp": "2024-10-01T12:20:00.000Z",
  "version": "1.0.0",
  "uptime": 5.2
}

// GET /api/status (with X-API-Key header)
{
  "message": "API is running",
  "timestamp": "2024-10-01T12:20:00.000Z"
}
```

### Verify Setup

```bash
# Check services are healthy
docker compose ps
# Should show secure-api and secure-nginx as "Up (healthy)"

# Run tests
docker compose exec api npm run test:run
```

### Stop Services

```bash
docker compose down
```

## Deployment — Production Setup

### Prerequisites
- VPS or self-hosted server (Ubuntu 20.04+ recommended)
- Docker & Docker Compose installed
- Cloudflare account with domain
- SSH access to server

### Step 1: Prepare Your Server

```bash
ssh user@your-server.com
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

### Step 2: Deploy Application

```bash
cd /opt
git clone <your-repo> server
cd server

# Create production environment file
cp .env.example .env.prod
nano .env.prod  # Edit with your values
```

Update `.env.prod` with:
```bash
NODE_ENV=production
PORT=3000
API_KEYS=your-secure-key-1,your-secure-key-2  # Generate with: openssl rand -hex 32
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
CLOUDFLARED_TOKEN=<your-cloudflare-tunnel-token>
```

### Step 3: Start Services

```bash
export $(cat .env.prod | xargs)
docker compose --profile prod up -d

# Verify
docker compose ps
docker compose logs -f api
```

### Step 4: Setup Cloudflare Tunnel (Free Public URL)

On your local machine:
```bash
# Install Cloudflare CLI
brew install cloudflare/cloudflare/cloudflared  # macOS
# Or: `apt install cloudflared` on Linux

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create my-api-tunnel

# Get token and add to server
cloudflared tunnel token my-api-tunnel
# Copy token → add to server's .env.prod as CLOUDFLARED_TOKEN
```

Restart tunnel on server:
```bash
cd /opt/server
docker compose --profile prod restart cloudflare-tunnel
```

### Step 5: Configure DNS

1. Go to Cloudflare dashboard
2. Add CNAME record: `api.yourdomain.com` → your tunnel ID
3. Test: `curl https://api.yourdomain.com/health`

### Step 6: Monitoring & Logs

```bash
# View logs
docker compose logs -f api

# Check service health
docker compose ps

# Monitor resources
docker stats

# View errors only
docker compose logs api | grep -i error
```

## API Usage

### Public Endpoint (No Auth)

```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-10-01T12:20:00.000Z",
  "version": "1.0.0",
  "uptime": 123.45
}
```

### Protected Endpoints (Requires X-API-Key Header)

```bash
curl -H "X-API-Key: your-api-key" http://localhost/api/status

Response (200 OK):
{
  "message": "API is running",
  "timestamp": "2024-10-01T12:20:00.000Z"
}
```

### Error Responses

```bash
# Missing API key (401)
curl http://localhost/api/status
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header",
  "timestamp": "2024-10-01T12:20:00.000Z"
}

# Invalid API key (401)
curl -H "X-API-Key: wrong" http://localhost/api/status
{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "timestamp": "2024-10-01T12:20:00.000Z"
}

# Route not found (404)
curl -H "X-API-Key: key" http://localhost/nonexistent
{
  "error": "Not Found",
  "message": "Route GET /nonexistent not found",
  "timestamp": "2024-10-01T12:20:00.000Z"
}
```

## Common Commands

### Development

```bash
# Start services
docker compose up

# Run all tests
docker compose exec api npm run test:run

# Watch mode (re-runs on file changes)
docker compose exec api npm test

# View logs
docker compose logs -f api

# Specific test file
docker compose exec api npm test -- tests/health.test.ts
```

### Production

```bash
# Deploy new changes
git pull origin main
docker compose build --no-cache api
docker compose --profile prod up -d

# Restart a service
docker compose restart api
docker compose restart nginx
docker compose --profile prod restart cloudflare-tunnel

# View production logs
docker compose logs -f api --tail 100

# Check resource usage
docker stats
```

### Maintenance

```bash
# Stop everything (keeps data)
docker compose down

# Stop and remove everything
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up

# Clean up unused Docker resources
docker system prune
```

## Security

- **API Keys**: Generated with `openssl rand -hex 32` (256-bit)
- **Authentication**: Constant-time comparison (prevents timing attacks)
- **Transport**: Cloudflare Tunnel handles TLS/HTTPS encryption
- **Non-root**: API runs as unprivileged `nodejs` user in Docker
- **Environment**: API keys stored in `.env.prod`, never committed to git
- **Logging**: Structured JSON logs that don't leak sensitive data
- **CORS**: Configured per domain in environment variables

## Configuration

### Environment Variables

See `.env.example` for all options:

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `production` | App environment |
| `PORT` | `3000` | Internal API port |
| `API_KEYS` | `key1,key2` | Comma-separated team keys |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `CORS_ORIGIN` | `https://yourdomain.com` | Allowed origin |
| `CLOUDFLARED_TOKEN` | `(long token)` | Cloudflare Tunnel token |

### Generating API Keys

```bash
# Generate one key (256-bit)
openssl rand -hex 32

# Generate multiple
openssl rand -hex 32
openssl rand -hex 32
openssl rand -hex 32

# Add to .env.prod
API_KEYS=key1,key2,key3
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs

# Clean and rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Port 80 Already in Use

```bash
# Find what's using port 80
lsof -i :80

# Option 1: Kill the process
sudo kill -9 <PID>

# Option 2: Change port in docker-compose.yml
# Change: ports: - "80:80"
# To: ports: - "8080:80"
# Then test: curl http://localhost:8080/health
```

### API Returning 500 Errors

```bash
# Check logs
docker compose logs api

# Run tests
docker compose exec api npm run test:run

# Restart
docker compose restart api
```

### Can't Access API Externally

```bash
# 1. Check Cloudflare Tunnel is running
docker logs secure-cloudflare-tunnel

# 2. Verify API is healthy internally
curl http://localhost/health

# 3. Check DNS is configured in Cloudflare
nslookup api.yourdomain.com

# 4. Check token validity
echo $CLOUDFLARED_TOKEN | wc -c  # Should be 512+ characters
```

## Project Structure

```
server/
├── api/                        # Express backend
│   ├── src/
│   │   ├── index.ts           # Server entry point & graceful shutdown
│   │   ├── app.ts             # Express app configuration
│   │   ├── config.ts          # Environment & configuration
│   │   ├── logger.ts          # Pino logging setup
│   │   ├── types.ts           # TypeScript types
│   │   ├── middleware/
│   │   │   └── apiKeyAuth.ts  # API key validation
│   │   └── routes/
│   │       └── health.ts      # Health check endpoint
│   ├── tests/                 # Test suite (Vitest)
│   ├── Dockerfile             # Multi-stage build
│   └── package.json
├── nginx/
│   └── nginx.conf             # Reverse proxy configuration
├── docker-compose.yml         # Service orchestration
├── .env.example               # Environment template
└── README.md                  # This file
```

## Testing

All tests run with **Vitest**:

```bash
# Run all tests
docker compose exec api npm run test:run

# Tests include:
# - Health endpoint validation
# - API key authentication
# - Configuration loading
# - Error handling
# - Route validation
```

## Architecture

```
┌─────────────────────────────────────┐
│      Cloudflare Tunnel              │  TLS encryption, DDoS protection
│      (Public Internet)              │
└──────────────────┬──────────────────┘
                   │ (Internal HTTPS)
                   ▼
┌─────────────────────────────────────┐
│      Nginx Reverse Proxy            │  Compression, security headers, logging
│      (Port 80, internal)            │
└──────────────────┬──────────────────┘
                   │ (Internal network)
                   ▼
┌─────────────────────────────────────┐
│      Express API (Node.js)          │  API key auth, request handling
│      (Port 3000, internal)          │
└─────────────────────────────────────┘
```

