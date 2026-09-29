# Getting Started - Local Development

This guide walks through setting up and testing the API on your local machine.

## System Requirements

- Docker and Docker Compose installed
- 2+ GB free disk space
- Port 80 available (or modify docker-compose.yml)

## Quick Setup (5 minutes)

### 1. Start the Services

```bash
cd server
docker compose up
```

This will:
- Build the Express API container
- Build/pull the Nginx container
- Start both services with proper networking
- Display logs for both services

Wait for messages like:
```
secure-api  | [some-timestamp] INFO: Server started successfully
secure-nginx | [some-timestamp] healthcheck passed
```

### 2. Verify Services are Running

In another terminal:

```bash
# Check all services are healthy
docker compose ps

# Should show:
# NAME              STATUS
# secure-api        Up (healthy)
# secure-nginx      Up (healthy)
```

### 3. Test the Health Endpoint

```bash
curl http://localhost/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 12.3
}
```

Great! The API is running. 🎉

## Testing the API

### Test 1: Health Endpoint (No Auth)

```bash
curl http://localhost/health
```

This endpoint is publicly accessible without authentication for monitoring.

### Test 2: Protected Endpoint Without Key (Should Fail)

```bash
curl http://localhost/api/status
```

Expected: 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 3: Protected Endpoint With Valid Key (Should Work)

```bash
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status
```

Expected: 200 OK

```json
{
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 4: Protected Endpoint With Invalid Key (Should Fail)

```bash
curl -H "X-API-Key: wrong-key" http://localhost/api/status
```

Expected: 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 5: Nonexistent Endpoint (Should Fail)

```bash
curl -H "X-API-Key: local-test-key-1" http://localhost/nonexistent
```

Expected: 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Route GET /nonexistent not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Running Tests

### Run All Tests

```bash
docker compose exec api npm run test:run
```

This runs:
- Health endpoint tests
- API key authentication tests
- Configuration validation tests
- Error handling tests

### Watch Mode (Continuous Testing)

```bash
docker compose exec api npm test

# Tests will re-run on file changes
# Press Ctrl+C to exit
```

### Run Specific Test File

```bash
docker compose exec api npm run test -- tests/health.test.ts
```

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f nginx

# Follow specific pattern
docker compose logs -f | grep error
```

### Stop Services

```bash
docker compose down
```

Services will stop but data persists.

### Stop and Remove Everything

```bash
docker compose down -v
```

This removes containers and volumes.

### Rebuild Services

```bash
docker compose build --no-cache
docker compose up
```

## API Keys for Local Development

Available test keys (defined in `.env.local`):
- `local-test-key-1`
- `local-test-key-2`
- `local-test-key-3`

Use any of these with the `X-API-Key` header:

```bash
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status
curl -H "X-API-Key: local-test-key-2" http://localhost/api/status
curl -H "X-API-Key: local-test-key-3" http://localhost/api/status
```

## Troubleshooting

### Port 80 Already in Use

```bash
# Find what's using port 80
lsof -i :80

# Option 1: Stop the other service
kill -9 <PID>

# Option 2: Change Nginx port in docker-compose.yml
# Change: ports: - "80:80"
# To: ports: - "8080:80"
# Then access at: curl http://localhost:8080/health
```

### Services won't start

```bash
# Check logs for errors
docker compose logs

# Check Docker daemon is running
docker ps

# Clear and rebuild
docker compose down -v
docker system prune
docker compose build --no-cache
docker compose up
```

### API returning 500 errors

```bash
# Check API logs
docker compose logs api

# Restart API service
docker compose restart api

# Run tests to verify
docker compose exec api npm run test:run
```

### Nginx returning 502 Bad Gateway

```bash
# Check if API is running
docker compose exec api curl http://localhost:3000/health

# Check Nginx logs
docker compose logs nginx

# Verify API is healthy
docker compose ps | grep api

# Restart both
docker compose restart api nginx
```

## Development Workflow

### 1. Make Changes

Edit files in `api/src/`:
- `routes/` - Add new endpoints
- `middleware/` - Add new middleware
- `config.ts` - Add configuration options
- `logger.ts` - Adjust logging

### 2. Rebuild on File Change

With Docker Compose running, changes to source files are auto-detected. The API will restart automatically if you:

```bash
# Or manually rebuild
docker compose build api
docker compose up
```

### 3. Test Changes

```bash
# Run test suite
docker compose exec api npm run test:run

# Test endpoint manually
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status
```

### 4. Commit and Push

```bash
git add api/ docker-compose.yml nginx/ README.md
git commit -m "Add: API endpoint description"
git push
```

## Build and Compile

### Build TypeScript

```bash
docker compose exec api npm run build
```

Compiles TypeScript to JavaScript in `dist/` directory.

### View Compiled Code

```bash
docker compose exec api ls -la dist/
docker compose exec api cat dist/index.js | head -20
```

## Next Steps

1. **Review the code structure** - Check `api/src/` to understand how things are organized
2. **Read the main README** - See [README.md](README.md) for full documentation
3. **Setup Cloudflare Tunnel** - See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) when ready for production
4. **Deploy to server** - See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

## Quick Reference - All Tests

```bash
# Health endpoint
curl http://localhost/health

# API without key (fails)
curl http://localhost/api/status

# API with key (works)
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status

# API with wrong key (fails)
curl -H "X-API-Key: wrong" http://localhost/api/status

# API with nonexistent route (fails)
curl -H "X-API-Key: local-test-key-1" http://localhost/nonexistent

# Run automated tests
docker compose exec api npm run test:run
```

## Questions?

- Check service status: `docker compose ps`
- View error logs: `docker compose logs api --tail 50`
- Verify connectivity: `curl -v http://localhost/health`
- Check configuration: `cat .env.local`
