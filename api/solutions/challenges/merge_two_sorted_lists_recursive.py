"""
Merge Two Sorted Lists — Solution B: Recursive
───────────────────────────────────────────────
At each call choose the node with the smaller value as the head of the
merged list, then recursively merge the remainder.

Base cases: if either list is exhausted, return the other.

Time:  O(m + n)
Space: O(m + n)  — recursion stack depth equals total node count
"""


class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution(object):
    def mergeTwoLists(self, list1, list2):
        # Base cases: one list is empty, so the answer is the other
        if not list1:
            return list2
        if not list2:
            return list1

        if list1.val <= list2.val:
            # list1's head wins; its tail still needs to be merged
            list1.next = self.mergeTwoLists(list1.next, list2)
            return list1
        else:
            # list2's head wins; its tail still needs to be merged
            list2.next = self.mergeTwoLists(list1, list2.next)
            return list2
