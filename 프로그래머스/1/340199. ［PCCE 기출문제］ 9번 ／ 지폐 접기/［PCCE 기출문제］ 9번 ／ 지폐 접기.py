'''다양한 지폐 수집 취미, 
길이가 긴쪽을 반으로 접음, 접기전 길이가 홀수면 접은 후 소수점 이하는 버려(/)
접힌 지폐를 그대로/ 90도 돌려서 넣을 수 있다면 그만 접음'''
def solution(wallet, bill):
    answer = 0

    while max(wallet) < max(bill) or min(wallet) < min(bill):
        if bill[0] > bill[1]:
            bill[0] = bill[0] // 2
        else:
            bill[1] = bill[1] // 2

        answer += 1

    return answer