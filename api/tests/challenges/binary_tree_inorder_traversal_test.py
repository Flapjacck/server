"""
Tests for: Binary Tree Inorder Traversal
Difficulty: Easy

These tests are run against the student's solution.py file, which must define:
  - class TreeNode
  - class Solution with a solve(self, root) method

Inorder traversal visits nodes in Left → Root → Right order.
"""

import pytest
from solution import TreeNode, Solution
from collections import deque


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_tree(values: list) -> "TreeNode | None":
    """
    Build a binary tree from a BFS-level list where None marks missing nodes.

    Example: [1, None, 2, 3] produces:
        1
         \\
          2
         /
        3
    """
    if not values or values[0] is None:
        return None

    root = TreeNode(values[0])
    queue = deque([root])
    i = 1

    while queue and i < len(values):
        node = queue.popleft()

        # Left child
        if i < len(values):
            if values[i] is not None:
                node.left = TreeNode(values[i])
                queue.append(node.left)
            i += 1

        # Right child
        if i < len(values):
            if values[i] is not None:
                node.right = TreeNode(values[i])
                queue.append(node.right)
            i += 1

    return root


# ── Test cases ────────────────────────────────────────────────────────────────

sol = Solution()


def test_example_1():
    """[1,null,2,3] → [1,3,2]"""
    root = build_tree([1, None, 2, 3])
    result = sol.solve(root)
    assert result == [1, 3, 2], f"Expected [1,3,2] but got {result}"


def test_example_2():
    """[1,2,3,4,5,null,8,null,null,6,7,9] → [4,2,6,5,7,1,3,9,8]"""
    root = build_tree([1, 2, 3, 4, 5, None, 8, None, None, 6, 7, 9])
    result = sol.solve(root)
    assert result == [4, 2, 6, 5, 7, 1, 3, 9, 8], (
        f"Expected [4,2,6,5,7,1,3,9,8] but got {result}"
    )


def test_empty_tree():
    """Empty tree (None root) → []"""
    result = sol.solve(None)
    assert result == [], f"Expected [] for empty tree but got {result}"


def test_single_node():
    """Single node [1] → [1]"""
    root = build_tree([1])
    result = sol.solve(root)
    assert result == [1], f"Expected [1] but got {result}"
