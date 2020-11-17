import { isNumber } from "./util"

class MultimethodError extends Error {
  constructor(name, args) {
    super(
      `No matching multimethod: ${name}(${args
        .map(a => a.toString())
        .join(", ")})`
    )
  }
}

const Multimethod = (name = "Unknown") => {
  const overloads = []

  const baseFn = (...args) => {
    for (const [matcher, fn] of overloads) {
      if (args.every((arg, i) => matcher[i](arg))) {
        return fn(...args)
      }
    }

    throw new MultimethodError(name, args)
  }

  baseFn.assign = (matcher, fn) => {
    overloads.unshift([matcher, fn])
    return baseFn
  }

  return baseFn
}

export const merge = Multimethod("merge").assign(
  [isNumber, isNumber],
  (x, y) => x + y
)

export const eq = Multimethod("eq")

export const add = Multimethod("add").assign(
  [isNumber, isNumber],
  (x, y) => x + y
)

export const subtract = Multimethod("subtract").assign(
  [isNumber, isNumber],
  (x, y) => x - y
)

export const multiply = Multimethod("multiply").assign(
  [isNumber, isNumber],
  (x, y) => x * y
)

export const divide = Multimethod("divide").assign(
  [isNumber, isNumber],
  (x, y) => x / y
)

export const square = Multimethod("square").assign([isNumber], x => x ** 2)

export const squareRoot = Multimethod("squareRoot").assign(
  [isNumber],
  Math.sqrt
)
