# OWS — Open Web Services

OWS is a self-hosted control plane for this Proxmox box. The name is a play on AWS: **Open Web Services**. It is a private console for running containers, databases, and HTTP routes on hardware you already own — not a clone of Amazon's catalog.

This file is the product bible. The code in this repo should match the current phase, not the whole roadmap.

## Why this exists

Resume projects that survive interviews are finished, opinionated systems — not 10% of AWS. OWS is built to show fullstack + infrastructure work that a todo app cannot:

- A real backend that orchestrates compute, not only CRUD
- A frontend operators can actually use
- Docker, reverse proxy, and a public tunnel on a home server
- Decisions you can defend: isolation, persistence, networking, scope

This runs on Proxmox. The control plane lives in an LXC that already runs Docker. Later phases talk to that Docker daemon; they do not require Kubernetes.

## What "AWS-like" means here

AWS-like **UX**: a console, named services, one-click create/destroy, resource limits, a connection string when you spin up a database.

Not AWS-like **surface area**. No S3 clone, no Lambda, no IAM/VPC/region model, no Kubernetes — unless a later need is strong enough to justify it. A half-built cloud looks worse on a resume than a small finished PaaS.

## Current phase

**Phase 0 — control-plane shell (shipped in this slice)**

- Express API with a public `GET /health`
- Vite React console that proves the browser can reach the API
- Docker Compose without Postgres
- Tests that run the same way on the Proxmox host and in GitHub Actions

Health is public on purpose. Auth starts when there are mutating APIs.

## Architecture (phase 0)

```
Public web user
  -> Cloudflare edge
  -> Cloudflare Tunnel (outbound from the LXC)
  -> Nginx Proxy Manager
  -> ows-web (nginx + Vite build)
  -> GET /health
  -> ows-api (Express)
```

The home server does not need inbound ports for the public UI. Cloudflare is the public entry. NPM stays private on the Docker network. Point the NPM proxy host at **web port 80**.

CI and the smoke script skip Cloudflare and NPM. They hit `http://127.0.0.1:8080/health` on the published web port.

```
Proxmox host
  LXC (this repo)
    Docker
      cloudflared
      npm
      ows-web
      ows-api
```

Phase 0 does **not** mount `docker.sock`. The API cannot spawn containers yet.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| API | Node 22, Express 5, TypeScript | Same language as the UI; typed contracts; runs in Alpine |
| UI | Vite, React 19, TypeScript | Fast console, nginx-served static build |
| Edge | Cloudflare Tunnel + NPM | Already on this box; no inbound ports |
| Tests | `node:test` + supertest (API), Vitest + Testing Library (UI), `scripts/smoke.sh` | Unit tests inside Docker build targets; smoke hits the running stack |
| CI | GitHub Actions | Same Docker commands as the server |

## Health contract

`GET /health` returns:

```json
{
  "ok": true,
  "service": "ows-api",
  "timestamp": "2026-08-23T18:00:00.000Z"
}
```

The UI treats any other shape, a non-200, or a network failure as down.

## Phases

### Phase 0 — control-plane shell (now)

Status console + health API + Docker + tests + CI. Done when `/health` is green in the UI, `docker build --target test` passes for api and web, and `scripts/smoke.sh` passes against compose.

### Phase 1 — container lifecycle

Mount the Docker socket into the API (read/write, tightly scoped). List, create, stop, delete containers from the console. CPU, RAM, and disk limits. No Swarm, no k8s.

Interview meat: process isolation vs VM isolation, why the socket is a privilege boundary, how we keep the API from becoming root-on-the-host by accident.

### Phase 2 — one-click Postgres

A catalog item that starts Postgres with a named volume and shows a connection string in the UI. Persistence is the point: containers are cattle, volumes are not.

### Phase 3 — HTTP routing

Map a hostname to a container, through NPM's API or Caddy. This is the "point a domain at my app" moment. Without it, containers are only reachable from inside Docker.

### Phase 4 — live resource graphs

CPU and RAM for the host and for each managed container. docker stats or cAdvisor — pick one, do not build a metrics platform.

### Later, only if justified

Object storage, secrets, a real identity model. Each of those is a product, not a checkbox.

## Non-goals

- Recreating AWS service-for-service
- Kubernetes on this LXC
- Multi-node clustering
- Billing, orgs, or a public SaaS
- Local-first developer experience as a requirement (this is tested on the server and in CI)

## How to run (server)

```bash
cd /opt/server
cp .env.example .env
# set TUNNEL_TOKEN for Cloudflare
docker compose up -d --build
docker compose ps
```

NPM proxy host still points at **web:80**. `/` is the console. `/health` is proxied to the API.

## How to test (server and GitHub)

Same commands in both places. No local Node install required.

```bash
docker build --target test ./api
docker build --target test ./web
docker compose up -d --build api web
bash scripts/smoke.sh
```

GitHub Actions runs those three checks on every push and pull request.

## Resume and interviews

One-liner: **OWS is a self-hosted control plane that runs on Proxmox — a private console for containers, databases, and HTTP routes.**

Talk about:

- Why the first slice is a health contract, not a feature dump
- How traffic reaches a machine with no inbound ports
- Why Docker-on-LXC is the compute layer instead of VMs or k8s
- What mounting `docker.sock` implies (phase 1)
- How a volume makes a database survive a container replace (phase 2)
- Why routing is a separate problem from compute (phase 3)

If a phase is not built, say so. A clear roadmap beats a fake platform.
