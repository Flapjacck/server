def solution(scores):
    curve = 100 - max(scores)
    curved_scores = []
    letter_grades = []
    for s in scores:
        new_score = s + curve
        curved_scores.append(new_score)
        if new_score >= 90:
            letter_grades.append("A")
        elif new_score >= 80:
            letter_grades.append("B")
        elif new_score >= 70:
            letter_grades.append("C")
        elif new_score >= 60:
            letter_grades.append("D")
        else:
            letter_grades.append("F")
    average = round(sum(curved_scores) / len(curved_scores), 1)
    return letter_grades, average


if __name__ == "__main__":
    score1 = int(input())
    score2 = int(input())
    score3 = int(input())
    letter_grades, average = solution([score1, score2, score3])
    for grade in letter_grades:
        print(grade)
    print(f"{average:.1f}")
