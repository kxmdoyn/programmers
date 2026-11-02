def solution(arr1, arr2):
    k = []
    for i, array in enumerate(arr1):
        row = []
        for j, num in enumerate(array):
            p=arr1[i][j] + arr2[i][j]
            row.append(p)
        k.append(row)
        
   
    return k