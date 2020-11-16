import {
  merge,
  eq,
  multiply,
  divide,
  square,
  squareRoot,
} from "./multimethods.mjs"
import { ContridictionError } from "./contridiction.mjs"
import { isNumber } from "./util.mjs"

class Interval_ {
  constructor(low, high) {
    this.low = low
    this.high = high
  }
}

export const Interval = (low, high) => new Interval_(low, high)

const isInterval = value => value instanceof Interval_

const isEqualInterval = (x, y) => x.low === y.low && x.high === y.high

const multiplyInterval = (x, y) => Interval(x.low * y.low, x.high * y.high)

const divideInterval = (x, y) =>
  multiplyInterval(x, Interval(1 / y.high, 1 / y.low))

const squareInterval = x => Interval(x.low ** 2, x.high ** 2)

const squareRootInterval = x => Interval(Math.sqrt(x.low), Math.sqrt(x.high))

const isEmptyInterval = x => x.low > x.high

const intersectIntervals = (x, y) =>
  Interval(Math.max(x.low, y.low), Math.min(x.high, y.high))

const ensureInsideInterval = (x, y) => {
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
  .assign([isNumber, isInterval], (content, increment) =>
    ensureInsideInterval(increment, content)
  )
  .assign([isInterval, isNumber], ensureInsideInterval)

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
