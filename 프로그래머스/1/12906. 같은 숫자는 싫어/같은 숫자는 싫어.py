'''배열 arr이 주어짐, arr은 각 원소가 숫자 0부터 9까지로 이루어짐,
이때 배열 arr에서 연속적으로 나타나는 숫자는 하나만 남기고 전부 제거 하려함, 제거된 남은 수들은 반환할때는 배열 arr의 원소들을 순서대로 유지해야함,, '''
def solution(arr):
    k = []
    k.append(arr[0])
    for i in range(0, len(arr)):
        if len(arr) > i+1:
            if arr[i] != arr[i+1] :
                k.append(arr[i+1])
    return k