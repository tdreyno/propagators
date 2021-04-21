import { show } from "../multimethods/index"

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a, ...b])

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => b.has(x)))

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set<T>([...a].filter(x => !b.has(x)))

export const isSet = (value: unknown): value is Set<unknown> =>
  value instanceof Set

show.assign(
  [isSet],
  set =>
    `Set<${Array.from(set)
      .map(a => show.call(a))
      .join(", ")}>`,
)
