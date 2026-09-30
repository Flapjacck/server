"""
Tests for: Merge Two Sorted Lists
Difficulty: Easy

These tests are run against the student's solution.py file, which must define:
  - class ListNode
  - class Solution with a mergeTwoLists(self, list1, list2) method
"""

import pytest
from solution import ListNode, Solution


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_list(values: list) -> "ListNode | None":
    """Build a linked list from a Python list. Returns None for empty input."""
    dummy = ListNode(0)
    curr = dummy
    for v in values:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next


def to_list(node: "ListNode | None") -> list:
    """Walk a linked list and return its values as a Python list."""
    result = []
    while node:
        result.append(node.val)
        node = node.next
    return result


# ── Test cases ────────────────────────────────────────────────────────────────

sol = Solution()


def test_example_1():
    """[1,2,4] merged with [1,3,4] should give [1,1,2,3,4,4]"""
    l1 = make_list([1, 2, 4])
    l2 = make_list([1, 3, 4])
    result = to_list(sol.mergeTwoLists(l1, l2))
    assert result == [1, 1, 2, 3, 4, 4], (
        f"Expected [1,1,2,3,4,4] but got {result}"
    )


def test_both_empty():
    """Two empty lists should return None (empty list)"""
    result = sol.mergeTwoLists(None, None)
    assert result is None, (
        f"Expected None for two empty lists but got a node with val={result.val if result else '?'}"
    )


def test_one_empty_left():
    """Empty list1 + [0] should return [0]"""
    l2 = make_list([0])
    result = to_list(sol.mergeTwoLists(None, l2))
    assert result == [0], f"Expected [0] but got {result}"


def test_single_elements_reverse_order():
    """[2] merged with [1] should give [1,2] (smaller first)"""
    l1 = make_list([2])
    l2 = make_list([1])
    result = to_list(sol.mergeTwoLists(l1, l2))
    assert result == [1, 2], f"Expected [1,2] but got {result}"
