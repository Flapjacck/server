import importlib.util
from pathlib import Path
import os


def _load_user():
    # Try multiple locations
    possible_paths = [
        Path("/tmp/user.py"),
        Path("/submission/user.py"),
        Path("/tmp/judge-submissions/user.py"),
    ]
    
    path = None
    for p in possible_paths:
        if p.exists():
            path = p
            break
    
    if not path:
        raise FileNotFoundError(f"Could not find user submission. Tried: {possible_paths}")
    spec = importlib.util.spec_from_file_location("user_submission", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_mixed_list():
    user = _load_user()
    assert user.sum_of_evens([1, 2, 3, 4, 5]) == 6


def test_all_odd():
    user = _load_user()
    assert user.sum_of_evens([1, 3, 5]) == 0


def test_empty():
    user = _load_user()
    assert user.sum_of_evens([]) == 0


def test_negatives():
    user = _load_user()
    assert user.sum_of_evens([-2, -1, 0, 3, 4]) == 2
