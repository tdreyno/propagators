import { merge, eq, show } from "../multimethods/index"

export class Just_<T = any> {
  constructor(private value: T) {}

  map<U>(fn: (value: T) => U): Maybe<U> {
    return Just(fn(this.value))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fold<U>(justFn: (value: T) => U, _nothingFn: () => U): U {
    return justFn(this.value)
  }

  chain<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return fn(this.value)
  }

  unwrap(): T {
    return this.value
  }
}

export const Just = <T>(value: T) => new Just_<T>(value)
export type Just<T> = Just_<T>

export const isJust = <T>(value: Just_ | T): value is Just_ =>
  value instanceof Just_

export type Maybe<T> = Just<T> | Nothing

export class Nothing_ {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map<T, U>(_fn: (value: T) => U): Maybe<U> {
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fold<U>(_justFn: (value: unknown) => U, nothingFn: () => U): U {
    return nothingFn()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chain<T, U>(_fn: (value: T) => Maybe<U>): Maybe<U> {
    return this
  }

  unwrap(): undefined {
    return undefined
  }
}

export const Nothing = new Nothing_()
export type Nothing = Nothing_

// Check if a value is equal to the special value "Nothing"
export const isNothing = <T>(value: Nothing_ | T): value is Nothing_ =>
  value instanceof Nothing_

// Check if a value is not equal to the special value "Nothing"
export const isAnything = <T>(value: Nothing_ | T): value is T =>
  !isNothing(value)

export const fromNullable = <T>(value: T | undefined | null): Maybe<T> =>
  value === undefined || value === null ? Nothing : Just(value)

merge
  .assign([isNothing, isNothing], () => Nothing)
  .assign([isAnything, isNothing], content => content)
  .assign([isNothing, isAnything], (_, increment) => increment)

eq.assign([isNothing, isNothing], () => true)
  .assign([isAnything, isNothing], () => false)
  .assign([isNothing, isAnything], () => false)
  .assign([isAnything, isAnything], (a, b) => a === b)

show.assign([isNothing], () => "Nothing")
