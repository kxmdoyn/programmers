def solution(answers):
    A = answers
    x = [1, 2, 3, 4, 5]                      # 1번 수포자
    y = [2, 1, 2, 3, 2, 4, 2, 5]             # 2번 수포자
    z = [3, 3, 1, 1, 2, 2, 4, 4, 5, 5]       # 3번 수포자

    list_a = [x[i % len(x)] for i in range(len(A))]
    list_b = [y[i % len(y)] for i in range(len(A))]
    list_c = [z[i % len(z)] for i in range(len(A))]

    score = [0, 0, 0]  # 각 수포자의 정답 개수

    for i in range(len(A)):
        if A[i] == list_a[i]:
            score[0] += 1
        if A[i] == list_b[i]:
            score[1] += 1
        if A[i] == list_c[i]:
            score[2] += 1

    max_score = max(score)
    result = [i + 1 for i, s in enumerate(score) if s == max_score]

    return result
