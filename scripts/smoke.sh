#!/usr/bin/env bash
set -euo pipefail

URL="${SMOKE_URL:-http://127.0.0.1:8080/health}"
MAX_ATTEMPTS="${SMOKE_ATTEMPTS:-30}"
SLEEP_SECONDS="${SMOKE_SLEEP:-2}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  if body=$(curl -fsS "$URL"); then
    echo "$body" | grep -q '"ok":true'
    echo "$body" | grep -q '"service":"ows-api"'
    echo "smoke ok: $body"
    exit 0
  fi
  echo "waiting for $URL ($attempt/$MAX_ATTEMPTS)"
  sleep "$SLEEP_SECONDS"
done

echo "smoke failed: $URL never became healthy"
exit 1
