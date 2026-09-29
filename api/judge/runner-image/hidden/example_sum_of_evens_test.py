import importlib.util
from pathlib import Path


def _load_user():
    path = Path("/submission/user.py")
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
