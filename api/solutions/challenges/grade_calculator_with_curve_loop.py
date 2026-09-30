"""
Grade Calculator with Curve — Solution A: Explicit loop
────────────────────────────────────────────────────────
Step-by-step approach:
  1. Find the curve amount needed to bring the highest score to 100.
  2. Loop over scores to apply the curve and collect letter grades.
  3. Compute and return the average.

Time:  O(n)
Space: O(n)  — storing the curved scores and grades
"""


def get_letter_grade(score):
    """Return the letter grade for a post-curve score."""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def calculate_with_curve(scores):
    # How many points does the top student need to reach 100?
    curve = 100 - max(scores)

    curved_scores = []
    letter_grades = []
    for s in scores:
        new_score = s + curve
        curved_scores.append(new_score)
        letter_grades.append(get_letter_grade(new_score))

    average = round(sum(curved_scores) / len(curved_scores), 1)
    return letter_grades, average


if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())

    letter_grades, average = calculate_with_curve([score1, score2, score3])

    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
