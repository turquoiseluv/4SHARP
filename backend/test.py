import collections

def solution(s):
    size = len(s) - 1
    answer = size * (size + 1) * (size + 2) // 6
    dict = collections.Counter(s)
    if len(dict) == 1:
        return 0
    for r in dict.items():
        if r[1] > 1:
            idx = []
            i = 0
            while s.find(r[0], i) != -1:
                idx.append(s.find(r[0], i))
                i = s.find(r[0], i)+1
            idxlen = len(idx)
            for j in range(0, idxlen-1):
                for k in range(j+1, idxlen):
                    answer -= idx[k] - idx[j] - 1
    return answer


print(solution("baab"))