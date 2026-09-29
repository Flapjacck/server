#!/bin/bash
set -e

TASK_ID="${1:-}"
SUBMISSION_FILE="${2:-user.py}"

if [ -z "$TASK_ID" ]; then
    echo '{"passed": 0, "total": 0, "error": "bad_args"}' >&2
    exit 1
fi

# Copy the submission file to /tmp (which is writable)
if [ -f "/tmp/judge-submissions/$SUBMISSION_FILE" ]; then
    cp "/tmp/judge-submissions/$SUBMISSION_FILE" "/tmp/user.py"
elif [ -f "/tmp/judge-submissions/user.py" ]; then
    cp "/tmp/judge-submissions/user.py" "/tmp/user.py"
else
    echo '{"passed": 0, "total": 0, "error": "submission_not_found"}' >&2
    exit 1
fi

# Run the tests
python /opt/run_tests.py "$TASK_ID"
