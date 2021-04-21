import { show } from "../multimethods/index"

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a, ...b])

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => b.has(x)))

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => !b.has(x)))

export const map = <T, U>(fn: (item: T) => U, set: Set<T>): Set<U> =>
  new Set<U>([...set].map(fn))

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
