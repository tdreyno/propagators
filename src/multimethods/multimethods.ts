import { isPojo } from "../util/isPojo"

class MultimethodError extends Error {
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

export class Multimethod<R = unknown, Args extends unknown[] = unknown[]> {
  private overloads_: Array<
    [
      { [K in keyof Args]: Matcher<unknown> },
      (...args: { [K in keyof Args]: unknown }) => unknown,
    ]
  > = []

  constructor(public name = "Unknown") {}

  call = (...args: Args): R => {
    for (const [matcher, fn] of this.overloads_) {
      if (args.every((arg, i) => matcher[i](arg))) {
        return fn(...args) as R
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
    this.overloads_.unshift([matcher, fn] as any)
    return this
  }
}
