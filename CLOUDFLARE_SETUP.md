# Cloudflare Tunnel Setup Guide

This guide walks you through setting up Cloudflare Tunnel to expose your API to the public internet securely.

## Prerequisites

- Cloudflare account (free tier works)
- Domain registered with Cloudflare
- `cloudflared` CLI installed
- Docker and Docker Compose running

## Step 1: Install Cloudflare CLI

### macOS (Homebrew)
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Linux (apt)
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Windows
Download from: https://github.com/cloudflare/cloudflared/releases

## Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will open a browser window asking you to authorize. Select your Cloudflare account and domain, then authorize the application.

Credentials will be saved to `~/.cloudflared/cert.pem`

## Step 3: Create a Tunnel

```bash
cloudflared tunnel create my-api-tunnel
```

Output will show:
- Tunnel ID
- Tunnel credentials file location

Save the **Tunnel ID** - you'll need it later.

## Step 4: Get the Tunnel Token

For Docker deployments, you should use a tunnel token instead of credentials file.

```bash
cloudflared tunnel token my-api-tunnel
```

This will output a long token string. **Save this safely** - treat it like a password.

## Step 5: Test Locally (Optional)

### Create config file (`~/.cloudflared/config.yml`)

```yaml
tunnel: my-api-tunnel
credentials-file: /home/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

Replace:
- `YOUR_USERNAME` with your system username
- `TUNNEL_ID` with your actual tunnel ID (shown during tunnel creation)
- `yourdomain.com` with your actual domain

### Run tunnel locally

```bash
cloudflared tunnel run my-api-tunnel
```

You should see a message like: `Connected to api.yourdomain.com`

Test with:
```bash
curl https://api.yourdomain.com/health
```

## Step 6: Deploy to Production Server

### On your server, create `.env.prod`

```bash
# Copy from .env.example and fill in production values
cp .env.example .env.prod

# Edit .env.prod and set:
NODE_ENV=production
API_KEYS=your-secure-production-key-1,your-secure-production-key-2
CLOUDFLARED_TOKEN=paste-your-token-from-step-4
```

**Never commit `.env.prod` to git** - it contains secrets!

### Start services with Cloudflare Tunnel

```bash
# Load .env.prod variables
export $(cat .env.prod | xargs)

# Start with production profile (includes Cloudflare Tunnel)
docker-compose --profile prod up -d
```

### Verify tunnel is running

```bash
docker logs secure-cloudflare-tunnel

# Should show:
# Connected to api.yourdomain.com
```

### Test from public internet

```bash
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","version":"1.0.0","uptime":120.5}
```

## Step 7: Configure DNS (Route53/Cloudflare)

### In Cloudflare Dashboard:

1. Go to DNS settings for your domain
2. Create a CNAME record:
   - **Name**: `api`
   - **Type**: `CNAME`
   - **Content**: `TUNNEL_ID.cfargotunnel.com`
   - Replace `TUNNEL_ID` with your actual tunnel ID
3. Enable Cloudflare proxy (orange cloud icon)

This ensures traffic routes through Cloudflare's global network.

## Step 8: Persistent Tunnel on Server

For a long-running server, consider setting up a systemd service or letting Docker Compose manage it.

### With Docker Compose (Recommended)

Already configured! Just use:

```bash
docker-compose --profile prod up -d
```

The tunnel will automatically restart if it crashes.

### With Systemd (Alternative)

```bash
sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=cloudflare
ExecStart=/usr/local/bin/cloudflared tunnel run --token TOKEN_HERE
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

## Troubleshooting

### Tunnel not connecting

Check logs:
```bash
docker logs secure-cloudflare-tunnel

# Or if using systemd:
sudo journalctl -u cloudflared -f
```

### API returns 502 Bad Gateway

- Verify Nginx is running: `docker logs secure-nginx`
- Verify API is running: `docker logs secure-api`
- Check health endpoint: `curl http://localhost/health` (from server)

### DNS not resolving

- Wait a few minutes for DNS propagation
- Verify CNAME in Cloudflare dashboard
- Clear browser cache

### TLS certificate errors

Cloudflare automatically handles TLS certificates. If you see SSL errors:
- Clear browser cache
- Wait 5 minutes for certificate generation
- Check Cloudflare SSL/TLS settings (should be Full or Flexible)

## Security Best Practices

1. **Rotate API Keys Regularly**
   - Update `API_KEYS` in `.env.prod` every 90 days
   - Restart containers: `docker-compose restart api`

2. **Limit Tunnel Access**
   - Use Cloudflare Access/Zero Trust to restrict who can reach your API
   - Consider IP allowlists

3. **Monitor Tunnel Traffic**
   - Check Cloudflare Analytics for traffic patterns
   - Set up alerts for unusual activity

4. **Keep Cloudflared Updated**
   - Docker image auto-updates from `cloudflare/cloudflared:latest`
   - Periodically rebuild: `docker-compose build --pull`

5. **Never Hardcode Secrets**
   - Use `.env` files (git-ignored)
   - Use Docker secrets for production (advanced)

## Cleanup

### Remove tunnel locally (keep production running)

```bash
docker-compose --profile prod down
```

### Delete tunnel completely (careful!)

```bash
cloudflared tunnel delete my-api-tunnel
```

## Further Reading

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/do-more-with-tunnel/)
- [Cloudflare CLI Reference](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/identity/users/)
