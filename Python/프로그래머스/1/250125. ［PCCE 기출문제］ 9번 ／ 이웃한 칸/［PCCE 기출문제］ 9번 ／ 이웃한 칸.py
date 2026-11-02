def solution(board, h, w):
    cnt = 0
    color = board[h][w]
    n = len(board)

    # 위쪽 검사
    if h > 0:
        if board[h-1][w] == color:
            cnt += 1

    # 아래쪽 검사
    if h+1 < n:
        if board[h+1][w] == color:
            cnt += 1

    # 오른쪽 검사
    if w+1<n:
        if board[h][w+1] == color:
            cnt += 1

    # 왼쪽 검사
    if w > 0 :
        if board[h][w-1] == color:
            cnt += 1

    return cnt