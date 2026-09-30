"""
Binary Tree Inorder Traversal — Solution A: Recursive DFS
──────────────────────────────────────────────────────────
Classic recursive approach: traverse left subtree, visit root, traverse
right subtree.

Time:  O(n)  — every node is visited exactly once
Space: O(h)  — call stack depth equals tree height h (O(n) worst case)
"""


class TreeNode(object):
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution(object):
    def inorderTraversal(self, root):
        result = []

        def dfs(node):
            if node is None:
                return
            dfs(node.left)       # visit left subtree first
            result.append(node.val)  # then record this node
            dfs(node.right)      # then right subtree

        dfs(root)
        return result
