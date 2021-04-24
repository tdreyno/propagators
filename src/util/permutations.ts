const swap = (arr: Array<any>, i: number, j: number): void => {
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

export const permutations = <T>(items: Array<T>): Array<Array<T>> => {
  const result: Array<Array<T>> = []

  const permute = (arr: Array<T>, current: number): void => {
    if (current >= arr.length) {
      result.push(arr.slice())
      return
    }

    for (let i = current; i < arr.length; i += 1) {
      swap(arr, i, current)
      permute(arr, current + 1)
      swap(arr, i, current)
    }
  }

  permute(items, 0)

  return result
}
