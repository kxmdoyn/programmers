def solution(arr):
    k = 0
    j = 0
    for i in range(len(arr)):
        k += arr[i]
        j +=1
    p = k/j
    return p