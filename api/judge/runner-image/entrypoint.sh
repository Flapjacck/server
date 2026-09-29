#!/bin/bash
set -e

TASK_ID="${1:-}"
SUBMISSION_FILE="${2:-user.py}"

if [ -z "$TASK_ID" ]; then
    echo '{"passed": 0, "total": 0, "error": "bad_args"}' >&2
    exit 1
fi

# Create submission directory if needed
mkdir -p /submission

# Copy or link the submission file
if [ -f "/tmp/judge-submissions/$SUBMISSION_FILE" ]; then
    cp "/tmp/judge-submissions/$SUBMISSION_FILE" "/submission/user.py"
elif [ -f "/tmp/judge-submissions/user.py" ]; then
    cp "/tmp/judge-submissions/user.py" "/submission/user.py"
else
    echo '{"passed": 0, "total": 0, "error": "submission_not_found"}' >&2
    exit 1
fi

# Run the tests
python /opt/run_tests.py "$TASK_ID"
