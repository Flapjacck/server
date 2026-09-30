"""
Tests for: Grade Calculator with Curve
Difficulty: Easy (custom)

These tests are run against the student's solution.py file, which must define:
  - calculate_with_curve(scores: list[int]) -> tuple[list[str], float]
      Given a list of 3 scores, apply a curve so the highest score becomes 100,
      return the letter grades for all three (in input order) and the class average.

Grading scale (applied AFTER curve):
  90–100 → 'A'
  80–89  → 'B'
  70–79  → 'C'
  60–69  → 'D'
  < 60   → 'F'
"""

import pytest
from solution import calculate_with_curve


# ── Test cases ────────────────────────────────────────────────────────────────

def test_basic_curve():
    """
    [70, 40, 50] → curve adds 30 → [100, 70, 80]
    Grades: A, C, B    Average: 83.3
    """
    grades, avg = calculate_with_curve([70, 40, 50])
    assert grades == ["A", "C", "B"], (
        f"Expected grades ['A','C','B'] but got {grades}"
    )
    assert round(avg, 1) == 83.3, (
        f"Expected average 83.3 but got {round(avg, 1)}"
    )


def test_already_at_top():
    """
    [100, 100, 100] → no curve needed → all A's, average 100.0
    """
    grades, avg = calculate_with_curve([100, 100, 100])
    assert grades == ["A", "A", "A"], (
        f"Expected ['A','A','A'] but got {grades}"
    )
    assert round(avg, 1) == 100.0, (
        f"Expected average 100.0 but got {round(avg, 1)}"
    )


def test_shift_all_up():
    """
    [50, 60, 70] → curve adds 30 → [80, 90, 100]
    Grades: B, A, A    Average: 90.0
    """
    grades, avg = calculate_with_curve([50, 60, 70])
    assert grades == ["B", "A", "A"], (
        f"Expected ['B','A','A'] but got {grades}"
    )
    assert round(avg, 1) == 90.0, (
        f"Expected average 90.0 but got {round(avg, 1)}"
    )
