import { isNumber } from "./util"

const proto = Object.prototype
const gpo = Object.getPrototypeOf

function isPojo(obj: unknown) {
  if (obj === null || typeof obj !== "object") {
    return false
  }
  return gpo(obj) === proto
}

class MultimethodError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(name: string, args: Array<any>) {
    const argsString = args
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      .map(a => `${typeof a}: ${isPojo(a) ? JSON.stringify(a) : a.toString()}`)
      .join(", ")
    super(`No matching multimethod: ${name}(${argsString})`)
  }
}

type Matcher<T = unknown> = (value: unknown) => value is T
type MatcherType<T> = T extends Matcher<infer U> ? U : never

class Multimethod<Args extends unknown[]> {
  private overloads_: Array<
    [
      { [K in keyof Args]: Matcher<unknown> },
      (...args: { [K in keyof Args]: unknown }) => unknown,
    ]
  > = []

  constructor(public name = "Unknown") {}

  call(...args: Args): unknown {
    for (const [matcher, fn] of this.overloads_) {
      if (args.every((arg, i) => matcher[i](arg))) {
        return fn(...args)
      }
    }

    throw new MultimethodError(this.name, args)
  }

  assign<A extends Matcher>(
    matcher: [A],
    fn: (a: MatcherType<A>) => unknown,
  ): this
  assign<A extends Matcher, B extends Matcher>(
    matcher: [A, B],
    fn: (a: MatcherType<A>, b: MatcherType<B>) => unknown,
  ): this
  assign<A extends Matcher, B extends Matcher, C extends Matcher>(
    matcher: [A, B, C],
    fn: (a: MatcherType<A>, b: MatcherType<B>, c: MatcherType<C>) => unknown,
  ): this
  assign<
    A extends Matcher,
    B extends Matcher,
    C extends Matcher,
    D extends Matcher
  >(
    matcher: [A, B, C, D],
    fn: (
      a: MatcherType<A>,
      b: MatcherType<B>,
      c: MatcherType<C>,
      d: MatcherType<D>,
    ) => unknown,
  ): this
  assign(matcher: unknown[], fn: (...args: unknown[]) => unknown): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.overloads_.unshift([matcher, fn] as any)
    return this
  }
}

export const merge = new Multimethod<[unknown, unknown]>("merge").assign(
  [isNumber, isNumber],
  (x, y) => x + y,
)

export const eq = new Multimethod("eq")

export const add = new Multimethod("add").assign(
  [isNumber, isNumber],
  (x, y) => x + y,
)

export const subtract = new Multimethod("subtract").assign(
  [isNumber, isNumber],
  (x, y) => x - y,
)

export const multiply = new Multimethod("multiply").assign(
  [isNumber, isNumber],
  (x, y) => x * y,
)

export const divide = new Multimethod("divide").assign(
  [isNumber, isNumber],
  (x, y) => x / y,
)

export const square = new Multimethod("square").assign([isNumber], x => x ** 2)

export const squareRoot = new Multimethod("squareRoot").assign(
  [isNumber],
  Math.sqrt,
)
