str = input()
result = []
for i in range(len(str)):
    if str[i].isupper():
        result.append(str[i].lower())
    else:
        result.append(str[i].upper())
result = "".join(result)
print(result)

    