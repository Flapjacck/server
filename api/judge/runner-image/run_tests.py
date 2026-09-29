#!/usr/bin/env python3
"""Run hidden pytest module for a task; print one JSON line to stdout."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

HIDDEN_DIR = Path("/opt/hidden")

TASK_TO_MODULE = {
    "example_sum_of_evens": "example_sum_of_evens_test.py",
}


def count_tests(test_path: Path) -> int:
    completed = subprocess.run(
        [sys.executable, "-m", "pytest", str(test_path), "--collect-only", "-q"],
        capture_output=True,
        text=True,
        cwd="/tmp",
    )
    count = 0
    for line in (completed.stdout or "").splitlines():
        if "::test_" in line:
            count += 1
    return count


def main() -> None:
    if len(sys.argv) != 2:
        print(json.dumps({"passed": 0, "total": 0, "error": "bad_args"}))
        sys.exit(1)

    task_id = sys.argv[1]
    module_name = TASK_TO_MODULE.get(task_id)
    if not module_name:
        print(json.dumps({"passed": 0, "total": 0, "error": "unknown_task"}))
        sys.exit(1)

    test_path = HIDDEN_DIR / module_name
    if not test_path.is_file():
        print(json.dumps({"passed": 0, "total": 0, "error": "missing_tests"}))
        sys.exit(1)

    total = count_tests(test_path)
    if total == 0:
        print(json.dumps({"passed": 0, "total": 0, "error": "missing_tests"}))
        sys.exit(1)

    completed = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            str(test_path),
            "-q",
            "--tb=no",
            "--no-header",
        ],
        capture_output=True,
        text=True,
        cwd="/tmp",
    )

    combined = f"{completed.stdout or ''}\n{completed.stderr or ''}"
    passed_match = re.search(r"(\d+)\s+passed", combined)
    failed_match = re.search(r"(\d+)\s+failed", combined)
    passed = int(passed_match.group(1)) if passed_match else 0
    failed = int(failed_match.group(1)) if failed_match else 0
    if passed + failed == 0 and completed.returncode == 0:
        passed = total

    print(json.dumps({"passed": passed, "total": total}))
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
