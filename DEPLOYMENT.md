# Deployment Guide

This guide covers deploying the secure API to a production server.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare (Public Internet)                                │
│ - DDoS Protection                                           │
│ - TLS Encryption                                            │
│ - Global CDN                                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ (Encrypted via Cloudflare Tunnel)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Your Server (VPS/Self-hosted)                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Docker Compose Services                              │  │
│  │                                                       │  │
│  │  ┌─────────────────┐      ┌──────────────────────┐  │  │
│  │  │  API Container  │─────▶│ Nginx Reverse Proxy  │  │  │
│  │  │  (Express.js)   │      │ (Port 80, internal)  │  │  │
│  │  │  (Port 3000)    │      └──────────────────────┘  │  │
│  │  └─────────────────┘              │                 │  │
│  │                                    │                 │  │
│  │                           ┌────────▼───────┐        │  │
│  │                           │ Cloudflare     │        │  │
│  │                           │ Tunnel Daemon  │        │  │
│  │                           │ (Port 443)     │        │  │
│  │                           └────────────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Prerequisites

- VPS or self-hosted server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- SSH access to server
- Cloudflare account with domain
- `cloudflared` CLI installed locally (for tunnel setup)

## Step 1: Server Preparation

### Update system

```bash
ssh user@your-server.com
sudo apt update && sudo apt upgrade -y
```

### Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Step 2: Deploy Application

### Clone repository

```bash
cd /opt  # or your preferred directory
git clone https://github.com/YOUR_USERNAME/server.git
cd server
```

### Create production environment file

**IMPORTANT**: Never commit `.env.prod` to git!

```bash
# Create from template
cp .env.example .env.prod

# Edit with production values
nano .env.prod
```

Production `.env.prod` should contain:

```bash
NODE_ENV=production
PORT=3000
API_KEYS=your-secure-key-1,your-secure-key-2
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
CLOUDFLARED_TOKEN=your-cloudflare-token-here
```

### Build and start services

```bash
# Load environment
export $(cat .env.prod | xargs)

# Build images (first time only)
docker compose build --no-cache

# Start all services with production profile
docker compose --profile prod up -d

# Verify services are running
docker compose ps

# Check logs
docker compose logs -f
```

## Step 3: Verify Deployment

### Check service health

```bash
# All services should show 'healthy' or 'running'
docker compose ps

# Check API health (internal only)
curl http://localhost/health

# Expected output:
# {"status":"ok","timestamp":"...","version":"1.0.0","uptime":...}
```

### Check Cloudflare Tunnel

```bash
# Verify tunnel is connected
docker logs secure-cloudflare-tunnel | tail -20

# Should show: "Connected to api.yourdomain.com"
```

### Test from public internet

Once tunnel is connected and DNS is configured:

```bash
# From any internet-connected device
curl https://api.yourdomain.com/health

# Test with API key
curl -H "X-API-Key: your-key-here" https://api.yourdomain.com/api/status
```

## Step 4: Configure Cloudflare Tunnel

See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for detailed tunnel configuration.

Quick summary:

```bash
# On your local machine
cloudflared tunnel login
cloudflared tunnel create my-api-tunnel
TUNNEL_ID=$(cloudflared tunnel list | grep my-api-tunnel | awk '{print $1}')
cloudflared tunnel token my-api-tunnel > tunnel_token.txt

# Add token to server's .env.prod
ssh user@your-server.com "echo 'CLOUDFLARED_TOKEN=...' >> /opt/server/.env.prod"

# Restart services on server
ssh user@your-server.com "cd /opt/server && docker compose --profile prod restart cloudflare-tunnel"
```

## Step 5: Monitoring and Maintenance

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f nginx
docker compose logs -f cloudflare-tunnel

# View only errors
docker compose logs --grep error
```

### Check system resources

```bash
docker stats
```

### Update application

```bash
cd /opt/server

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose build --no-cache api
docker compose up -d
```

### Restart services

```bash
# Restart all
docker compose --profile prod restart

# Restart specific service
docker compose restart api
docker compose restart nginx
```

## Step 6: Backup and Recovery

### Backup configuration

```bash
# Backup environment file (KEEP SECURE!)
cp /opt/server/.env.prod /secure/backup/env.prod.backup

# Backup docker-compose config
cp /opt/server/docker-compose.yml /secure/backup/docker-compose.yml.backup
```

### Restore from backup

```bash
cp /secure/backup/env.prod.backup /opt/server/.env.prod
cd /opt/server
docker compose --profile prod up -d
```

## Step 7: Security Hardening

### Firewall setup

```bash
# Only allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # Nginx (for Cloudflare Tunnel health checks)
sudo ufw enable
```

### SSH key-based authentication

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config

# Change these lines:
# PasswordAuthentication no
# PubkeyAuthentication yes

sudo systemctl restart sshd
```

### Log rotation

```bash
# Docker automatically manages logs, but configure retention
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

### Regular backups

```bash
# Add to crontab for daily backups
crontab -e

# Add this line:
0 2 * * * cp /opt/server/.env.prod /backup/env.prod.$(date +\%Y\%m\%d) && gzip /backup/env.prod.*
```

## Step 8: Monitoring Setup (Optional)

### Health check monitoring

```bash
# Add to crontab to monitor API health
*/5 * * * * curl -sf https://api.yourdomain.com/health > /dev/null || echo "API DOWN" | mail -s "API Health Alert" admin@yourdomain.com
```

### Uptime monitoring services

Consider using:
- Uptime Robot (free, external monitoring)
- Healthchecks.io
- Cloudflare Page Rules with Alerts

## Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs

# Common issues:
# 1. Port already in use: sudo lsof -i :80 or :3000
# 2. .env.prod missing: cp .env.example .env.prod
# 3. Docker daemon not running: sudo systemctl start docker
```

### API not accessible externally

```bash
# 1. Check Cloudflare Tunnel is running
docker logs secure-cloudflare-tunnel

# 2. Check Nginx is proxying correctly
curl http://localhost/health

# 3. Check API is healthy
curl http://localhost:3000/health

# 4. Check DNS is configured in Cloudflare Dashboard
nslookup api.yourdomain.com
```

### High memory/CPU usage

```bash
# Check which service is using resources
docker stats

# If API container using too much memory:
docker compose restart api

# If Nginx using too much:
docker compose logs nginx | grep "worker_connections"
```

### Tunnel keeps disconnecting

```bash
# Check token is valid in .env.prod
echo $CLOUDFLARED_TOKEN | wc -c  # Should be very long string

# Restart tunnel
docker compose --profile prod restart cloudflare-tunnel

# Monitor logs
docker logs -f secure-cloudflare-tunnel
```

## Performance Tuning

### Nginx optimization

Edit `nginx/nginx.conf`:
- Adjust `worker_connections` for high traffic
- Increase `proxy_buffer_size` if responses are large
- Modify `keepalive_timeout` based on traffic patterns

### API optimization

Edit `.env.prod`:
- Set `LOG_LEVEL=warn` to reduce logging overhead
- Monitor with `docker stats` during high traffic

### Docker resource limits

Add to `docker-compose.yml` services:

```yaml
api:
  # ...
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## Disaster Recovery

### Complete system recovery

If everything fails:

```bash
# 1. Stop all containers
docker compose --profile prod down

# 2. Check disk space and clean up
docker system prune

# 3. Rebuild from scratch
docker compose build --no-cache
docker compose --profile prod up -d

# 4. Verify everything is working
docker compose ps
curl https://api.yourdomain.com/health
```

### Data loss prevention

Current setup is stateless (no persistent data). For future database integration:

```bash
# Backup database
docker exec secure-api pg_dump database > backup.sql

# Restore database
cat backup.sql | docker exec -i secure-api psql database
```

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
