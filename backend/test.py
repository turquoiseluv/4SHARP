
'''
array = [[[[1,2,3],
          [4,5,6],
          [7,8,9]]]]

arr = array[0:1,:,0:1]
'''
import numpy as np
arr = [[1,2,3],[4,5,6]]
arr = np.array(arr)
arr2 = arr[0:2, 2] > 3
print(arr2)
arr3 = arr2.astype('float32')
print(1 - arr3)