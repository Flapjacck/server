"""
Grade Calculator with Curve  (Easy)
─────────────────────────────────────
Ask the user for 3 test scores (out of 100).  Calculate the average.
Curve the grades so that the top student always gets 100 by shifting
everyone's score up by the same amount.  Then print a letter grade for
each curved score (in input order) and the curved class average.

Grading scale (applied AFTER the curve):
  90–100 → A
  80–89  → B
  70–79  → C
  60–69  → D
  < 60   → F

Example:
  Input:  70  40  50
  Curve:  top score is 70, add 30 to everyone → 100, 70, 80
  Output:
    A
    C
    B
    83.3
"""


def get_letter_grade(score):
    """
    Return the letter grade string ('A'–'F') for a single curved score.
    :type score: int | float
    :rtype: str
    """
    # TODO: implement your solution here
    pass


def calculate_with_curve(scores):
    """
    Apply a curve to a list of 3 scores and return grades + average.

    The curve shifts every score up so the highest score becomes 100.

    :type scores: list[int]
    :rtype: tuple[list[str], float]
        - list[str]: letter grade for each input score (in original order)
        - float:     average of the curved scores, rounded to 1 decimal place
    """
    # TODO: implement your solution here
    pass


# ── Interactive entry point ───────────────────────────────────────────────────
# When a student runs this file directly, it reads scores from stdin and
# prints results.  The automated tests call calculate_with_curve() directly.

if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())

    letter_grades, average = calculate_with_curve([score1, score2, score3])

    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
