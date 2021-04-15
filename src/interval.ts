import { merge, eq, multiply, divide, square, squareRoot } from "./multimethods"
import { ContridictionError } from "./contridiction"
import { flip, isNumber } from "./util"

class Interval_ {
  constructor(public low: number, public high: number) {}
}

export const Interval = (low: number, high: number) => new Interval_(low, high)
export type Interval = Interval_

const isInterval = (value: unknown): value is Interval =>
  value instanceof Interval_

const isEqualInterval = (x: Interval, y: Interval): boolean =>
  x.low === y.low && x.high === y.high

const multiplyInterval = (x: Interval, y: Interval) =>
  Interval(x.low * y.low, x.high * y.high)

const divideInterval = (x: Interval, y: Interval) =>
  multiplyInterval(x, Interval(1 / y.high, 1 / y.low))

const squareInterval = (x: Interval) => Interval(x.low ** 2, x.high ** 2)

const squareRootInterval = (x: Interval) =>
  Interval(Math.sqrt(x.low), Math.sqrt(x.high))

const isEmptyInterval = (x: Interval): boolean => x.low > x.high

const intersectIntervals = (x: Interval, y: Interval) =>
  Interval(Math.max(x.low, y.low), Math.min(x.high, y.high))

const ensureInsideInterval = (x: Interval, y: number) => {
  if (x.low <= y && y <= x.high) {
    return y
  }

  throw new ContridictionError()
}

merge
  .assign([isInterval, isInterval], (content, increment) => {
    const newRange = intersectIntervals(content, increment)

    if (isEqualInterval(content, newRange)) {
      return content
    }

    if (isEqualInterval(content, increment)) {
      return increment
    }

    if (isEmptyInterval(newRange)) {
      throw new ContridictionError()
    }

    return newRange
  })
  .assign([isInterval, isNumber], ensureInsideInterval)
  .assign([isNumber, isInterval], flip(ensureInsideInterval))

eq.assign([isInterval, isInterval], isEqualInterval)

multiply
  .assign([isInterval, isInterval], multiplyInterval)
  .assign([isNumber, isInterval], (x, y) => multiplyInterval(Interval(x, x), y))
  .assign([isInterval, isNumber], (x, y) => multiplyInterval(x, Interval(y, y)))

divide
  .assign([isInterval, isInterval], divideInterval)
  .assign([isNumber, isInterval], (x, y) => divideInterval(Interval(x, x), y))
  .assign([isInterval, isNumber], (x, y) => divideInterval(x, Interval(y, y)))

square.assign([isInterval], squareInterval)

squareRoot.assign([isInterval], squareRootInterval)
