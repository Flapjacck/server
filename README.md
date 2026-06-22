# Server

```bash
cd /opt/server
cp .env.example .env
# optional: edit .env to set a real POSTGRES_PASSWORD and matching DATABASE_URL
docker compose up -d --build
docker compose ps
```

## Test the API

```bash
# health check
curl -s http://127.0.0.1:3000/health

# insert a string
curl -s -X POST http://127.0.0.1:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value":"hello from lxc"}'

# verify in postgres
docker compose exec postgres psql -U server -d server \
  -c "SELECT * FROM strings;"
```