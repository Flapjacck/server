class ListNode(object):
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution(object):
    def solve(self, list1, list2):
        if not list1:
            return list2
        if not list2:
            return list1
        if list1.val <= list2.val:
            list1.next = self.solve(list1.next, list2)
            return list1
        list2.next = self.solve(list1, list2.next)
        return list2
