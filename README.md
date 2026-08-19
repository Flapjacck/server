# home server server for backend services

This is the code for my personal backend server ran in docker containers in a lxc container.

I built it to avoid the bad free tiers on hosted backends and to make better use of my home server. The public API is exposed through Cloudflare Tunnels. The String Bay UI is served from the `web` container on the same Docker network.

## How traffic reaches the server safely

```mermaid
flowchart LR
 user[Public web user] --> cf[Cloudflare edge]
 cf --> tunnel[Cloudflare Tunnel]
 tunnel --> cloudflared[cloudflared container]
 cloudflared --> npm[Nginx Proxy Manager]
 npm --> web[web nginx]
 web --> spa[Vite app]
 web --> api[API container]
 api --> db[(Postgres)]

 user -. HTTPS only .-> cf
 cf -. no inbound ports exposed .-> tunnel
 cloudflared -. outbound connection only .-> cf
 npm -. reverse proxy, TLS termination, and routing .-> web
 web -. /health and /strings .-> api
 api -. API key auth + JSON limits + no-store headers .-> db
```

The home server does not need to expose the API directly to the public internet. Cloudflare is the public entry point, the tunnel makes an outbound connection from inside the network, and Nginx Proxy Manager keeps routing private inside Docker.

Point the NPM proxy host at **`web` port 80** (not `api:3000`). The UI is at `/`. `/health` and `/strings` still go to the API. Paste the API key in the UI; it stays in that browser tab and is never baked into the frontend build.

## Run it

```bash
cd /opt/server
cp .env.example .env
# optional: edit .env to set a real POSTGRES_PASSWORD and matching DATABASE_URL
docker compose up -d --build
docker compose ps
```
