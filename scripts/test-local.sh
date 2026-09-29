#!/bin/bash
# Test script for local development
# Run tests in Docker container

set -e

echo "=== Running API Tests ==="
docker compose exec -T api npm run test:run

echo ""
echo "=== Testing Health Endpoint ==="
sleep 2
curl -s http://localhost/health | jq .

echo ""
echo "=== Testing API Endpoint Without Key ==="
curl -s http://localhost/api/status | jq . || true

echo ""
echo "=== Testing API Endpoint With Valid Key ==="
curl -s -H "X-API-Key: local-test-key-1" http://localhost/api/status | jq .

echo ""
echo "=== Testing API Endpoint With Invalid Key ==="
curl -s -H "X-API-Key: invalid-key" http://localhost/api/status | jq . || true

echo ""
echo "✅ All tests completed!"
