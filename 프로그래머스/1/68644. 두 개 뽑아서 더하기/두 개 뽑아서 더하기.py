def solution(numbers):
    p =[]
    for i in range(len(numbers)):
        for j in range(len(numbers)):
            if i != j :
                a = numbers[i] + numbers[j]
                p.append(a)
                p = set(p)
                p = list(p)
            
    return sorted(p)