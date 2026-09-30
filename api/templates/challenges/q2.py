def get_letter_grade(score):
    """
    :type score: int | float
    :rtype: str
    """
    pass


def calculate_with_curve(scores):
    """
    :type scores: list[int]
    :rtype: tuple[list[str], float]
    """
    pass


if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())

    letter_grades, average = calculate_with_curve([score1, score2, score3])

    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
