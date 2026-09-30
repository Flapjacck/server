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

### Configure the tunnel origin (Docker Compose)

The tunnel container is **not** on the host network. In **Zero Trust → Networks → Tunnels → (your tunnel) → Public Hostname**, set the service URL to the **Compose service name**, not `localhost`:

| Field | Value |
|--------|--------|
| Subdomain | `api` (or your hostname) |
| Service type | HTTP |
| URL | **`http://nginx:80`** |

Using `http://localhost:80` or `http://127.0.0.1:80` causes **Cloudflare 502** — cloudflared would call itself, not nginx.

To test without nginx, you can temporarily use `http://api:3000` (API container only).

### Verify origin from the Docker network

```bash
docker run --rm --network server_internal curlimages/curl -s http://nginx/health
docker run --rm --network server_internal curlimages/curl -s http://api:3000/health
```

Both should return JSON with `"status":"ok"`.

### Verify tunnel is running

```bash
docker logs secure-cloudflare-tunnel

# Should show registered connections, not repeated origin errors
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

---

## Code Challenge Platform

This API includes a LeetCode-style code testing backend.  The sections below
document the challenge structure, API endpoints, and how to add new challenges.

### Architecture

```
User submits Python code (JSON body or .py file upload)
    ↓
POST /api/challenges/:challengeId/submit
    ↓
codeExecutor.ts — writes solution.py + test file to a temp dir,
                  runs pytest as a subprocess with a 10 s timeout
    ↓
testResultParser.ts — converts the pytest-json-report output into a
                      structured JSON response
    ↓
{ allPassed, totalDurationSeconds, tests: [ { name, passed, message } ] }
```

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/challenges/:challengeId/submit` | X-API-Key | Submit code for testing |
| `GET`  | `/api/challenges/:challengeId/template` | X-API-Key | Download blank starter file |

**Submit — request formats**

```jsonc
// Option A: JSON body
POST /api/challenges/merge_two_sorted_lists/submit
Content-Type: application/json
X-API-Key: <key>

{ "code": "class Solution:\n    def mergeTwoLists(self, ...):\n        ..." }
```

```
# Option B: multipart file upload
POST /api/challenges/merge_two_sorted_lists/submit
Content-Type: multipart/form-data
X-API-Key: <key>
Field: code = solution.py (max 100 KB)
```

**Submit — response**

```jsonc
// All tests passed
{
  "allPassed": true,
  "totalDurationSeconds": 0.043,
  "tests": [
    { "name": "example 1",                    "passed": true, "message": "", "durationSeconds": 0.01 },
    { "name": "both empty",                   "passed": true, "message": "", "durationSeconds": 0.001 },
    { "name": "one empty left",               "passed": true, "message": "", "durationSeconds": 0.001 },
    { "name": "single elements reverse order","passed": true, "message": "", "durationSeconds": 0.001 }
  ]
}

// A test failed
{
  "allPassed": false,
  "totalDurationSeconds": 0.031,
  "tests": [
    { "name": "example 1", "passed": false, "message": "AssertionError: Expected [1,1,2,3,4,4] but got []", "durationSeconds": 0.005 },
    { "name": "both empty", "passed": true,  "message": "", "durationSeconds": 0.001 }
  ]
}

// Syntax / import error
{
  "allPassed": false,
  "totalDurationSeconds": 0,
  "tests": [],
  "executionError": "SyntaxError: invalid syntax | line 5"
}
```

### Challenges

| ID (slug) | Title | Difficulty |
|-----------|-------|------------|
| `merge_two_sorted_lists` | Merge Two Sorted Lists | Easy |
| `binary_tree_inorder_traversal` | Binary Tree Inorder Traversal | Easy |
| `grade_calculator_with_curve` | Grade Calculator with Curve | Easy |

Challenge slugs may use hyphens or underscores interchangeably in the URL
(e.g. `merge-two-sorted-lists` and `merge_two_sorted_lists` both work).

### Directory Layout

```
api/
├── tests/challenges/          ← pytest test files (run against user code)
│   ├── merge_two_sorted_lists_test.py
│   ├── binary_tree_inorder_traversal_test.py
│   └── grade_calculator_with_curve_test.py
├── templates/challenges/      ← blank starter templates served for download
│   ├── merge_two_sorted_lists.py
│   ├── binary_tree_inorder_traversal.py
│   └── grade_calculator_with_curve.py
└── solutions/challenges/      ← reference solutions (not served publicly)
    ├── merge_two_sorted_lists_iterative.py
    ├── merge_two_sorted_lists_recursive.py
    ├── binary_tree_inorder_traversal_recursive.py
    ├── binary_tree_inorder_traversal_iterative.py
    ├── grade_calculator_with_curve_loop.py
    └── grade_calculator_with_curve_comprehension.py
```

### Adding a New Challenge

1. **Create the test file** in `api/tests/challenges/<slug>_test.py`.
   - Name test functions `test_<description>`.
   - Import from `solution` (e.g. `from solution import Solution`).

2. **Create the blank template** in `api/templates/challenges/<slug>.py`.
   - Include the problem statement as a docstring.
   - Stub out the required class/function with `pass`.

3. **(Optional) Add reference solutions** in `api/solutions/challenges/`.

4. **Verify** by running pytest locally:
   ```bash
   cp api/solutions/challenges/<slug>_<approach>.py /tmp/solution.py
   cp api/tests/challenges/<slug>_test.py /tmp/test_challenge.py
   python3 -m pytest /tmp/test_challenge.py -v
   ```

### Security Notes

- User code runs as the same OS user as the API process (`nodejs` in Docker).
- Each submission is isolated in a disposable temp directory under `/tmp`.
- `pytest-timeout` kills individual test cases after **10 seconds**.
- The subprocess is sent `SIGKILL` after **15 seconds** regardless.
- Submitted files are capped at **100 KB**.
