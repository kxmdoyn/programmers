def solution(my_string, overwrite_string, s):
    s = int(s)
    a = my_string[:s]
    b = overwrite_string
    z = len(overwrite_string)
    w = z+s
    c = my_string[w:]
    
    answer = a + b +c
    return answer