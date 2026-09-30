"""
Binary Tree Inorder Traversal — Solution B: Iterative (explicit stack)
───────────────────────────────────────────────────────────────────────
Simulate the recursive call stack manually. Push every left-spine node
onto the stack, then pop and record each node before pivoting to its
right subtree.

Time:  O(n)
Space: O(h)  — stack depth equals tree height
"""


class TreeNode(object):
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution(object):
    def inorderTraversal(self, root):
        result = []
        stack = []
        curr = root

        while curr or stack:
            # Descend all the way left, pushing each node
            while curr:
                stack.append(curr)
                curr = curr.left

            # Pop the deepest left node and record it
            curr = stack.pop()
            result.append(curr.val)

            # Now pivot to that node's right subtree
            curr = curr.right

        return result
