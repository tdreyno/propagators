// Check if value is a number
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && isFinite(value)

// Reverse predicate
export const not = <T>(fn: (value: T) => boolean) => (value: T) => !fn(value)

// Flip args
export const flip = <A, B, C>(fn: (a: A, b: B) => C) => (b: B, a: A) => fn(a, b)

// Range of numbers
export const range = (a: number, b = 0) =>
  Array(Math.abs(b - a))
    .fill(undefined)
    .map((_, i) => a + i)

const proto = Object.prototype
const gpo = Object.getPrototypeOf

export const isPojo = (obj: unknown) => {
  if (obj === null || typeof obj !== "object") {
    return false
  }

  return gpo(obj) === proto
}

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a, ...b])

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => b.has(x)))

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => !b.has(x)))

export const isSet = (value: unknown): value is Set<unknown> =>
  value instanceof Set

export const isString = (x: unknown): x is string =>
  Object.prototype.toString.call(x) === "[object String]"
