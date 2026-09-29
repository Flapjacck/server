#!/bin/bash
# Health check script for monitoring API status

echo "=== Checking Docker Services ==="
docker compose ps

echo ""
echo "=== API Health Check ==="
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
    curl -s http://localhost:3000/health | jq .
else
    echo "❌ API is down"
    exit 1
fi

echo ""
echo "=== Nginx Health Check ==="
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Nginx is healthy"
else
    echo "❌ Nginx is down"
    exit 1
fi

echo ""
echo "=== Container Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"

echo ""
echo "✅ All systems operational"
