
'''
participant 를 순회하면서 각 키값에 밸류값 더해주고, completion 돌면서 하나씩 빼주고, 값있는거 출력하기!
'''
def solution(participant, completion):
    answer = {}
    for i in participant:
        answer[i] = answer.get(i,0)
        answer[i] += 1
    for j in completion:
        answer[j] -= 1
    for x,y in answer.items():
        if y!=0:
            return x
        

                
                
                


'''
participant 를 순회하면서 각 키값에 밸류값 더해주고, completion 돌면서 하나씩 빼주고, 값있는거 출력하기!
'''