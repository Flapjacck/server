# OWS — Open Web Services

Self-hosted control plane for a Proxmox box. Phase 0 is a status console and a health API, running in Docker behind Cloudflare Tunnel and Nginx Proxy Manager.

The full product direction lives in [project_plan.md](project_plan.md).

## Traffic path

```
user -> Cloudflare -> tunnel -> NPM -> web (nginx) -> GET /health -> api
```

Point the NPM proxy host at **web port 80**, not `api:3000`. The UI is `/`. `/health` is proxied to the API.

## Run it

```bash
cd /opt/server
cp .env.example .env
# set TUNNEL_TOKEN for the Cloudflare tunnel
docker compose up -d --build
docker compose ps
```

`TUNNEL_TOKEN` is only required if you start `cloudflared`. Core stack is `api` + `web`.

## Test it

Same commands on the server and in GitHub Actions. Tests run inside Docker.

```bash
docker build --target test ./api
docker build --target test ./web
docker compose up -d --build api web
bash scripts/smoke.sh
```

The smoke script waits for `http://127.0.0.1:8080/health` and checks `ok` plus `service: ows-api`.
