# Secure Express API

A production-ready Express.js TypeScript API with secure API key authentication, Docker/Compose setup, Nginx reverse proxy, and Cloudflare Tunnel integration.

## Features

✅ **Security First**
- API key authentication with constant-time comparison (timing attack prevention)
- Environment variable management for secrets
- Non-root Docker user
- Health endpoint publicly accessible without auth
- Security headers configured in Nginx

✅ **Developer Experience**
- TypeScript with strict mode
- Hot reload in development
- Structured logging with Pino
- Comprehensive test coverage (Vitest)
- Docker Compose for local development

✅ **Production Ready**
- Multi-stage Docker builds (minimal image size)
- Graceful shutdown handling
- Health checks and monitoring
- Request logging and tracing
- Nginx reverse proxy with compression

✅ **Deployment**
- Docker and Docker Compose orchestration
- Local development mirrors production setup
- Cloudflare Tunnel for secure public internet exposure
- Comprehensive deployment guides

## Quick Start

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd server
   ```

2. **Create local environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Start services**
   ```bash
   docker compose up
   ```

4. **Test the API**
   ```bash
   # Health check (no auth required)
   curl http://localhost/health

   # API endpoint (auth required)
   curl -H "X-API-Key: local-test-key-1" http://localhost/api/status
   ```

5. **Run tests**
   ```bash
   docker compose exec api npm run test:run
   ```

## Project Structure

```
server/
├── api/                          # Express backend
│   ├── src/
│   │   ├── index.ts             # Server entry point
│   │   ├── app.ts               # Express app setup
│   │   ├── config.ts            # Configuration loading
│   │   ├── logger.ts            # Pino logging setup
│   │   ├── types.ts             # TypeScript types
│   │   ├── middleware/
│   │   │   └── apiKeyAuth.ts    # API key authentication
│   │   └── routes/
│   │       └── health.ts        # Health check endpoint
│   ├── tests/                   # Test suite
│   │   ├── health.test.ts
│   │   ├── apiKeyAuth.test.ts
│   │   └── config.test.ts
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── package.json
│   └── tsconfig.json
├── nginx/
│   └── nginx.conf               # Reverse proxy configuration
├── docker-compose.yml           # Docker Compose orchestration
├── .env.example                 # Environment template
├── .env.local                   # Local development env (git-ignored)
├── CLOUDFLARE_SETUP.md          # Cloudflare Tunnel setup guide
├── DEPLOYMENT.md                # Production deployment guide
└── README.md                    # This file
```

## Configuration

### Environment Variables

See `.env.example` for all configuration options:

```bash
NODE_ENV=development           # development|production|test
PORT=3000                      # Internal API port
API_KEYS=key1,key2,key3       # Comma-separated API keys
LOG_LEVEL=debug                # trace|debug|info|warn|error|fatal
CORS_ORIGIN=http://localhost  # CORS origin for browser requests
CLOUDFLARED_TOKEN=            # (Production only) Cloudflare Tunnel token
```

### API Keys

Generate secure API keys:

```bash
# Generate random hex string (32 bytes = 256 bits)
openssl rand -hex 32

# Example:
# API_KEYS=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6,x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6
```

## API Usage

### Health Check

```bash
# No authentication required
curl http://localhost/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 120.5
}
```

### Protected Endpoints

All endpoints except `/health` require `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost/api/status

# Response:
{
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses

```bash
# 401 Unauthorized - Missing API key
curl http://localhost/api/status
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

# 401 Unauthorized - Invalid API key
curl -H "X-API-Key: wrong" http://localhost/api/status
{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

# 404 Not Found
curl -H "X-API-Key: key" http://localhost/nonexistent
{
  "error": "Not Found",
  "message": "Route GET /nonexistent not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Development

### Running Tests

```bash
# Run tests in Docker
docker compose exec api npm run test:run

# Or run tests locally (with Node 20+)
cd api
npm install
npm test
```

### Building Locally

```bash
cd api
npm install
npm run build
npm start
```

### Code Quality

Tests are configured with Vitest and include:
- Unit tests for middleware and configuration
- Integration tests for endpoints
- Error handling verification
- API key validation tests

Run specific test file:
```bash
docker compose exec api npm run test -- tests/health.test.ts
```

## Docker

### Build Images

```bash
# Build all services
docker compose build

# Build specific service
docker compose build api
docker compose build nginx
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail 100
```

### Container Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart a service
docker compose restart api

# Remove containers and volumes
docker compose down -v
```

## Deployment

### Local to Production

1. **Prepare server** - See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Setup Cloudflare Tunnel** - See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)
3. **Deploy application** - Copy repository to server and run Docker Compose
4. **Configure DNS** - Point domain to Cloudflare Tunnel in DNS settings
5. **Test publicly** - Verify API is accessible via public URL

### Production Deployment Steps

```bash
# On your server:
cd /opt/server

# Create production environment
cp .env.example .env.prod
# Edit .env.prod with production values

# Load environment
export $(cat .env.prod | xargs)

# Start services with Cloudflare Tunnel
docker compose --profile prod up -d

# Verify
docker compose ps
curl https://api.yourdomain.com/health
```

## Monitoring

### Health Checks

Services include health checks:

```bash
# API health check
docker exec secure-api curl -f http://localhost:3000/health

# Nginx health check
docker exec secure-nginx wget --quiet --tries=1 --spider http://localhost/health

# View health status
docker compose ps
```

### Logs and Metrics

```bash
# View logs
docker compose logs -f api | grep -i "error\|warn"

# Check resource usage
docker stats secure-api secure-nginx

# Pino logging levels
# - trace: Most verbose, includes all details
# - debug: Development debugging
# - info: General informational messages
# - warn: Warning messages
# - error: Error messages only
```

## Security Considerations

- **API Keys**: Generate strong keys with `openssl rand -hex 32`
- **Environment Files**: Never commit `.env` or `.env.prod` to git
- **CORS**: Configure `CORS_ORIGIN` for your domain only
- **HTTPS**: Cloudflare Tunnel handles HTTPS encryption
- **Logging**: Be careful not to log sensitive data
- **Docker User**: API runs as non-root `nodejs` user
- **Updates**: Regularly update base Docker images

## Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs

# Check if ports are in use
lsof -i :80
lsof -i :3000
```

### API returning errors

```bash
# Check API is healthy
docker compose exec api npm run test:run

# View detailed logs
docker compose logs -f api --grep "error"
```

### Cloudflare Tunnel issues

```bash
# Verify tunnel is running
docker logs secure-cloudflare-tunnel

# Check tunnel token is valid
echo $CLOUDFLARED_TOKEN | wc -c  # Should be ~512+ characters
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## Next Steps

### Extend the API

1. Add more routes in `api/src/routes/`
2. Add middleware as needed
3. Write tests for new functionality
4. Update documentation

### Add Features

- Database integration (PostgreSQL, MongoDB)
- Rate limiting middleware
- Request validation with Zod
- Caching with Redis
- Message queues with Bull/RabbitMQ

### Monitor in Production

- Setup APM (Application Performance Monitoring)
- Configure error tracking (Sentry)
- Setup uptime monitoring
- Configure log aggregation

## License

MIT

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
2. Check [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for tunnel help
3. Review test files for usage examples
4. Check application logs with `docker compose logs`
