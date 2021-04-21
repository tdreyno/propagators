import { Cell, TransformingCell } from "../cell"
import { intersection, isNumber, isString, filterSet } from "../datatypes/index"

export const in_ = <T>(items: T[]): Cell<Set<T>> => {
  const itemsSet = new Set<T>(items)
  return TransformingCell<Set<T>>(content => intersection(content, itemsSet))
}

export const gt = <T extends number>(num: T): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isNumber(v) && v > num, content),
  )

export const gte = <T extends number>(num: T): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isNumber(v) && v >= num, content),
  )

export const lt = <T extends number>(num: T): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isNumber(v) && v < num, content),
  )

export const lte = <T extends number>(num: T): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isNumber(v) && v <= num, content),
  )

export const match = <T extends string>(regex: RegExp): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isString(v) && regex.exec(v) !== null, content),
  )

export const includes = <T extends string>(matcher: string): Cell<Set<T>> =>
  TransformingCell<Set<T>>(content =>
    filterSet(v => isString(v) && v.includes(matcher), content),
  )
