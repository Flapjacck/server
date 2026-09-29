#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${JUDGE_SMOKE_BASE_URL:-http://127.0.0.1:8080}"
API_KEY="${JUDGE_API_KEYS:-dev-key-change-me}"

if [[ -z "${API_KEY}" ]]; then
  echo "judge smoke failed: set JUDGE_API_KEYS"
  exit 1
fi

good_payload='{"task_id":"example_sum_of_evens","source":"def sum_of_evens(numbers):\n    return sum(n for n in numbers if n % 2 == 0)\n"}'
bad_payload='{"task_id":"example_sum_of_evens","source":"def sum_of_evens(numbers):\n    return -1\n"}'

good_body="$(curl -fsS -X POST "${BASE_URL}/judge/run" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "${good_payload}")"
echo "$good_body" | grep -q '"ok":true'
echo "$good_body" | grep -q '"passed":4'

bad_body="$(curl -fsS -X POST "${BASE_URL}/judge/run" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "${bad_payload}")"
echo "$bad_body" | grep -q '"ok":false'

status="$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/judge/run" \
  -H "Content-Type: application/json" \
  -d "${good_payload}")"
if [[ "$status" != "401" ]]; then
  echo "judge smoke failed: expected 401 without API key, got ${status}"
  exit 1
fi

echo "judge smoke ok"
