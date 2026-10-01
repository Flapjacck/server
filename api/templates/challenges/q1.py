def solution(scores):
    pass


if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())
    letter_grades, average = solution([score1, score2, score3])
    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
