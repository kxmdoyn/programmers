def solution(my_string, s, e):
    b = my_string[s:e+1][::-1]
    a = my_string[:s]
    c = my_string[e+1:]
    return a+b+c