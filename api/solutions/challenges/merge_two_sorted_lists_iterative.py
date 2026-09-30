"""
Merge Two Sorted Lists — Solution A: Iterative (two-pointer)
────────────────────────────────────────────────────────────
Build the merged list node-by-node with a dummy head and a running
pointer. At each step pick whichever current node has the smaller value
and advance that list's pointer. Append any remaining nodes at the end.

Time:  O(m + n)
Space: O(1)  — only the dummy node is allocated; all other nodes are reused
"""


class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution(object):
    def mergeTwoLists(self, list1, list2):
        # Dummy head simplifies edge cases (empty lists, first insertion)
        dummy = ListNode(0)
        curr = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                curr.next = list1
                list1 = list1.next
            else:
                curr.next = list2
                list2 = list2.next
            curr = curr.next

        # At most one list still has nodes; append it directly
        curr.next = list1 if list1 else list2

        return dummy.next
