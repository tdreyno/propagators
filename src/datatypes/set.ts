import { show } from "../multimethods/index"

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a, ...b])

export const unionMut = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  for (const x of b) {
    a.add(x)
  }

  return a
}

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => b.has(x)))

export const intersectionMut = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  for (const x of b) {
    if (!b.has(x)) {
      a.delete(x)
    }
  }

  return a
}

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => !b.has(x)))

export const differenceMut = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  for (const x of b) {
    if (b.has(x)) {
      a.delete(x)
    }
  }

  return a
}

export const map = <T, U>(fn: (item: T) => U, set: Set<T>): Set<U> =>
  new Set<U>([...set].map(fn))

export const equals = <T>(a: Set<T>, b: Set<T>): boolean => {
  if (a.size !== b.size) {
    return false
  }

  for (const i of a.entries()) {
    if (!b.has(i[0])) {
      return false
    }
  }

  return true
}

export const filter = <T>(
  fn: (item: T) => boolean | null | undefined,
  set: Set<T>,
): Set<T> => new Set<T>([...set].filter(fn))

export const isSet = (value: unknown): value is Set<unknown> =>
  value instanceof Set

show.assign(
  [isSet],
  set =>
    `Set<${Array.from(set)
      .map(a => show.call(a))
      .join(", ")}>`,
)
