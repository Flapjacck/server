"""
Grade Calculator with Curve — Solution B: List comprehension
──────────────────────────────────────────────────────────────
More concise version using list comprehensions and a chained ternary for
the letter-grade mapping.

Time:  O(n)
Space: O(n)
"""


def get_letter_grade(score):
    """Ternary chain returns the letter grade for a post-curve score."""
    return (
        "A" if score >= 90 else
        "B" if score >= 80 else
        "C" if score >= 70 else
        "D" if score >= 60 else
        "F"
    )


def calculate_with_curve(scores):
    curve = 100 - max(scores)
    curved = [s + curve for s in scores]
    letter_grades = [get_letter_grade(s) for s in curved]
    average = round(sum(curved) / len(curved), 1)
    return letter_grades, average


if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())

    letter_grades, average = calculate_with_curve([score1, score2, score3])

    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
