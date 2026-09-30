"""
Binary Tree Inorder Traversal  (Easy)
──────────────────────────────────────
Given the root of a binary tree, return the inorder traversal of its
nodes' values.  Inorder order is: Left subtree → Root → Right subtree.

Examples:
  Input:  root = [1,null,2,3]
  Output: [1,3,2]

  Input:  root = [1,2,3,4,5,null,8,null,null,6,7,9]
  Output: [4,2,6,5,7,1,3,9,8]

  Input:  root = []
  Output: []

  Input:  root = [1]
  Output: [1]

Constraints:
  - The number of nodes in the tree is in the range [0, 100].
  - -100 <= Node.val <= 100
"""


# Definition for a binary tree node.
# Do NOT rename or remove this class — the tests depend on it.
class TreeNode(object):
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution(object):
    def inorderTraversal(self, root):
        """
        :type root: Optional[TreeNode]
        :rtype: List[int]
        """
        # TODO: implement your solution here
        pass
