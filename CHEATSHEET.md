# Quick Reference Cheatsheet

## Local Development Commands

### Start Services
```bash
cd /home/spencer/gh/server
docker compose up
```

### Test Endpoints (in another terminal)
```bash
# Health endpoint (no auth)
curl http://localhost/health

# Protected endpoint (with auth)
curl -H "X-API-Key: local-test-key-1" http://localhost/api/status

# Protected endpoint (invalid key - should fail)
curl -H "X-API-Key: wrong-key" http://localhost/api/status

# Nonexistent route (should 404)
curl -H "X-API-Key: local-test-key-1" http://localhost/invalid
```

### Run Tests
```bash
# All tests
docker compose exec api npm run test:run

# Watch mode (re-runs on file change)
docker compose exec api npm test

# Specific test file
docker compose exec api npm test -- tests/health.test.ts
```

### View Logs
```bash
# All services
docker compose logs -f

# API only
docker compose logs -f api

# Nginx only
docker compose logs -f nginx

# Last 50 lines
docker compose logs --tail 50
```

### Stop Services
```bash
docker compose down
```

### Clean Up Everything
```bash
docker compose down -v
docker system prune
```

---

## Production Commands

### Prepare Server
```bash
ssh user@yourserver.com
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Deploy Application
```bash
cd /opt/server
cp .env.example .env.prod
# Edit .env.prod with real values
nano .env.prod

export $(cat .env.prod | xargs)
docker compose --profile prod up -d
```

### Verify Deployment
```bash
docker compose ps
docker compose logs -f
curl https://api.yourdomain.com/health
```

### Restart Services
```bash
docker compose restart api
docker compose restart nginx
docker compose --profile prod restart cloudflare-tunnel
```

### Update Application
```bash
git pull origin main
docker compose build --no-cache
docker compose --profile prod up -d
```

---

## API Key Generation

### Generate Production Keys
```bash
# Generate random 32-byte hex string (256-bit key)
openssl rand -hex 32

# Generate multiple
openssl rand -hex 32
openssl rand -hex 32
openssl rand -hex 32

# Add to .env.prod
# API_KEYS=<key1>,<key2>,<key3>
```

---

## Cloudflare Tunnel Setup

### Quick Start
```bash
# Install CLI
brew install cloudflare/cloudflare/cloudflared  # macOS

# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create my-api-tunnel

# Get token (save this!)
cloudflared tunnel token my-api-tunnel

# Add token to .env.prod
# CLOUDFLARED_TOKEN=<token>
```

### Start Tunnel Locally (for testing)
```bash
cloudflared tunnel run my-api-tunnel
```

---

## Configuration

### Local Development (.env.local)
```bash
NODE_ENV=development
PORT=3000
API_KEYS=local-test-key-1,local-test-key-2,local-test-key-3
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost
```

### Production (.env.prod)
```bash
NODE_ENV=production
PORT=3000
API_KEYS=<your-secure-keys>
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
CLOUDFLARED_TOKEN=<your-tunnel-token>
```

---

## File Locations

```
/home/spencer/gh/server/
├── api/
│   ├── src/
│   │   ├── index.ts           - Server entry point
│   │   ├── app.ts             - Express app
│   │   ├── config.ts          - Configuration
│   │   ├── logger.ts          - Logging
│   │   ├── types.ts           - Types
│   │   ├── middleware/
│   │   │   └── apiKeyAuth.ts  - Authentication
│   │   └── routes/
│   │       └── health.ts      - Health endpoint
│   ├── tests/
│   │   ├── health.test.ts     - Health tests
│   │   ├── apiKeyAuth.test.ts - Auth tests
│   │   └── config.test.ts     - Config tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── nginx/
│   └── nginx.conf             - Reverse proxy
├── docker-compose.yml         - Orchestration
├── .env.local                 - Local config
├── .env.prod.example          - Production template
└── README.md, etc.            - Documentation
```

---

## Endpoints Summary

| Endpoint | Method | Auth | Returns |
|----------|--------|------|---------|
| `/health` | GET | ❌ No | {status, timestamp, version, uptime} |
| `/api/status` | GET | ✅ Yes | {message, timestamp} |

---

## API Key Examples

### Valid Request
```bash
curl -H "X-API-Key: local-test-key-1" \
  http://localhost/api/status
```

### Missing Key (401)
```bash
curl http://localhost/api/status
# Error: Missing X-API-Key header
```

### Invalid Key (401)
```bash
curl -H "X-API-Key: wrong" \
  http://localhost/api/status
# Error: Invalid API key
```

---

## Docker Commands

### Build
```bash
docker compose build
docker compose build --no-cache api
```

### Run
```bash
docker compose up
docker compose up -d  # Background
```

### Logs
```bash
docker compose logs
docker compose logs -f api
docker compose logs --tail 100
```

### Manage
```bash
docker compose ps
docker compose restart api
docker compose down
docker compose down -v  # Remove volumes
```

### Inspect
```bash
docker exec secure-api npm test:run
docker exec secure-api cat dist/index.js
docker stats secure-api
```

---

## Testing Quick Reference

### Local Testing Flow
```bash
# 1. Start services
docker compose up

# 2. In another terminal, test
curl http://localhost/health

# 3. Test with key
curl -H "X-API-Key: local-test-key-1" \
  http://localhost/api/status

# 4. Run suite
docker compose exec api npm run test:run
```

### Expected Results

**GET /health:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 12.345
}
```

**GET /api/status with valid key:**
```json
{
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**GET /api/status without key:**
```json
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Monitoring

### Health Check Status
```bash
docker compose ps
# Look for "healthy" status

# Detailed health
docker inspect --format='{{json .State.Health}}' secure-api | jq
```

### Resource Usage
```bash
docker stats secure-api secure-nginx
```

### Error Logs
```bash
docker compose logs | grep -i error
docker compose logs api | grep -i error
```

---

## Troubleshooting Quick Fixes

### Services Won't Start
```bash
docker compose logs              # Check errors
docker compose down -v           # Clean start
docker compose up                # Try again
```

### Port Already in Use
```bash
lsof -i :80                      # Find process
kill -9 <PID>                    # Kill it
# Or change port in docker-compose.yml
```

### API Returning 500
```bash
docker compose logs api          # Check logs
docker compose restart api       # Restart
docker compose exec api npm test:run  # Test
```

### Tests Failing
```bash
docker compose exec api npm test:run  # Verbose
docker compose logs api | grep error  # Errors
```

---

## Performance Commands

### Check Logs and Performance
```bash
# Request latency
docker compose logs api | grep latency

# Error rate
docker compose logs api | grep -c error

# Memory usage
docker stats --no-stream

# Disk usage
du -sh /home/spencer/gh/server
```

---

## Development Workflow

### Make a Change
```bash
# Edit file
nano api/src/routes/health.ts

# Save and Docker will detect
# Or manually rebuild
docker compose build api
docker compose up
```

### Write a Test
```bash
# Create test file
nano api/tests/newfeature.test.ts

# Run tests
docker compose exec api npm test:run
```

### Commit Code
```bash
git add api/src/ api/tests/
git commit -m "feat: Add new feature"
git push origin main
```

---

## Network Reference

### Internal Network
- API: `http://api:3000` (from Nginx)
- Nginx: `http://localhost:80` (from host)
- Tunnel: `http://nginx:80` (from tunnel)

### External Network
- Local: `http://localhost/health`
- Production: `https://api.yourdomain.com/health`

---

## Security Checklist (Pre-Production)

- [ ] Generated production API keys with `openssl rand -hex 32`
- [ ] Updated `.env.prod` with real keys
- [ ] Updated `.env.prod` with real domain in CORS_ORIGIN
- [ ] Setup Cloudflare Tunnel token in `.env.prod`
- [ ] Never committed `.env.prod` to git
- [ ] Configured DNS in Cloudflare dashboard
- [ ] Tested via public Cloudflare URL
- [ ] Verified HTTPS working
- [ ] Checked logs for errors
- [ ] Verified health endpoint responding

---

## Documentation Map

| Need | Document |
|------|----------|
| Project overview | README.md |
| Quick 5-min setup | GETTING_STARTED.md |
| System design | ARCHITECTURE.md |
| Server setup | DEPLOYMENT.md |
| Cloudflare setup | CLOUDFLARE_SETUP.md |
| After setup | NEXT_STEPS.md |
| What was built | SETUP_SUMMARY.md |
| Full report | COMPLETION_REPORT.md |

---

## Useful Environment Info

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Docker version
docker --version

# Check Docker Compose version
docker compose --version

# Check Cloudflare CLI version
cloudflared --version
```

---

## Git Commands

```bash
# Check status
git status

# View commits
git log --oneline | head -10

# Add and commit
git add .
git commit -m "Message"

# Push to remote
git push origin main

# View diff
git diff HEAD~1
```

---

## Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
alias dcup='docker compose up'
alias dcdown='docker compose down'
alias dclogs='docker compose logs -f'
alias dctest='docker compose exec api npm run test:run'
alias dcapi='docker compose exec api'

# Navigate to project
alias cdserver='cd /home/spencer/gh/server'
```

Then use: `dcup`, `dctest`, etc.

---

## Common Errors and Solutions

### "Port 80 already in use"
```bash
lsof -i :80
kill -9 <PID>
# Or change docker-compose.yml: ports: ["8080:80"]
```

### "Cannot connect to Docker daemon"
```bash
sudo systemctl start docker
# Or restart Docker app on macOS
```

### "npm ERR! code E401"
```bash
npm cache clean --force
npm install
```

### "TypeError: Cannot find module"
```bash
docker compose exec api npm install
docker compose build --no-cache
```

---

**Last Updated:** September 29, 2026
**Version:** 1.0
**Status:** Production Ready
