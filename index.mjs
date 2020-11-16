import { pipe, T, equals, is, prop, call, range } from "ramda"
import { Multimethod } from "./multimethod.mjs"

const DEBUG = false

const Nothing = Symbol("nothing")
const Contridiction = Symbol("contridiction")

class ContridictionError extends Error {
  constructor() {
    super(Contridiction)
  }
}

function log(...args) {
  if (!DEBUG) {
    return
  }

  console.log(...args)
}

// Check if value is a number
const isNumber = is(Number)

// Check if a value is not equal to the special value "Nothing"
const isAnything = T

// Reverse predicate
const not = fn => value => !fn(value)

// Check if a value is equal to the special value "Nothing"
const isNothing = equals(Nothing)

// Check if a value is equal to the special value "Contridiction"
const isContridiction = equals(Contridiction)

const propagator = (fn, inputs) => inputs.forEach(addNeighbor(fn))

// Wrap a function with a propagator
const functionToPropagator = (fn, name = "Unknown") => (...inputs) => {
  const output = inputs.pop()

  propagator(() => {
    log(`Notified ${name}`)

    const values = inputs.map(content)
    log("\tHas values", values)

    const result = values.some(isNothing) ? Nothing : fn(...values)
    log("\tResult", result)

    addContent(result, output)
  }, inputs)
}

class Cell_ {
  constructor(content = Nothing) {
    this.content = content
    this.neighbors = new Set()
  }
}

// Make a new, empty cell. Must pass generic for future type.
const Cell = content => new Cell_(content)

const cells = num => range(0, num).map(() => Cell())

// Get the content of a cell.
const content = prop("content")

// Cells are empty if their content is Nothing
const isEmpty = pipe(content, isNothing)

// Alert neighbords
const alertPropagators = neighbors => neighbors.forEach(call)

const addNeighbor = neighbor => cell => {
  cell.neighbors.add(neighbor)
  alertPropagators(new Set([neighbor]))
}

class Interval_ {
  constructor(low, high) {
    this.low = low
    this.high = high
  }
}

const Interval = (low, high) => new Interval_(low, high)

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

const merge = Multimethod("merge")
  .assign([isNothing, isNothing], () => Nothing)
  .assign([not(isNothing), isNothing], content => content)
  .assign([isNothing, not(isNothing)], (_, increment) => increment)
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
  .assign([isNumber, isNumber], (x, y) => x + y)

const eq = Multimethod("eq")
  .assign([isAnything, isAnything], (a, b) => a === b)
  .assign([isInterval, isInterval], isEqualInterval)

const add = Multimethod("add").assign([isNumber, isNumber], (x, y) => x + y)
const adder = functionToPropagator(add, "add(a, b)")

const subtract = Multimethod("subtract").assign(
  [isNumber, isNumber],
  (x, y) => x - y
)
const subtractor = functionToPropagator(subtract, "subtract(a, b)")

const multiply = Multimethod("multiply")
  .assign([isNumber, isNumber], (x, y) => x * y)
  .assign([isInterval, isInterval], multiplyInterval)
  .assign([isNumber, isInterval], (x, y) => multiplyInterval(Interval(x, x), y))
  .assign([isInterval, isNumber], (x, y) => multiplyInterval(x, Interval(y, y)))
const multiplier = functionToPropagator(multiply, "multiply(a, b)")

const divide = Multimethod("divide")
  .assign([isNumber, isNumber], (x, y) => x / y)
  .assign([isInterval, isInterval], divideInterval)
  .assign([isNumber, isInterval], (x, y) => divideInterval(Interval(x, x), y))
  .assign([isInterval, isNumber], (x, y) => divideInterval(x, Interval(y, y)))
const divider = functionToPropagator(divide, "divide(a, b)")

const square = Multimethod("square")
  .assign([isNumber], x => x ** 2)
  .assign([isInterval], squareInterval)
const squarer = functionToPropagator(square, "square(a)")

const squareRoot = Multimethod("squareRoot")
  .assign([isNumber], Math.sqrt)
  .assign([isInterval], squareRootInterval)
const squareRooter = functionToPropagator(squareRoot, "squareRoot(a)")

// Add content to the cell.
const addContent = (content, cell) => {
  log("Adding content", content)

  const answer = merge(cell.content, content)
  log("Merge", cell.content, content, answer)

  if (eq(answer, cell.content)) {
    log("Was equal")
    return
  }

  log("Setting", answer)
  cell.content = answer
  alertPropagators(cell.neighbors)
}

const product = (x, y, total) => {
  multiplier(x, y, total)
  divider(total, x, y)
  divider(total, y, x)
}

const quadratic = (x, xSquared) => {
  squarer(x, xSquared)
  squareRooter(xSquared, x)
}

// A propagator that always returns the same value
const constant = (content, output) =>
  functionToPropagator(a => a, `constant(${content})`)(Cell(content), output)

// if/else in propagator form
const conditional = (p, ifTrue, ifFalse) => output =>
  propagator(() => {
    const predicate = content(p)

    if (isNothing(predicate)) {
      return
    }

    const result = content(predicate ? ifTrue : ifFalse)
    addContent(result, output)
  }, [p, ifTrue, ifFalse])

// Continue only if predicate is true
const switch_ = (p, ifTrue) => conditional(p, ifTrue, Cell())

// Lazy network generator that doesn't run until it has
// one non-empty neighbor.
const compoundPropagator = (...inputs) => {
  const toBuild = inputs.pop()
  let done = false

  const test = () => {
    if (done) {
      return
    }

    if (inputs.every(isEmpty)) {
      return
    }

    done = true
    toBuild()
  }

  propagator(test, inputs)
}

const fallDuration = (t, h) =>
  compoundPropagator(t, h, () => {
    const [g, oneHalf, tSquared, gtSquared] = cells(4)

    constant(Interval(9.789, 9.832), g)
    constant(1 / 2, oneHalf)
    quadratic(t, tSquared)
    product(g, tSquared, gtSquared)
    product(oneHalf, gtSquared, h)
  })

const similarTriangles = (sBa, hBa, s, h) =>
  compoundPropagator(sBa, hBa, s, () => {
    const ratio = Cell()

    product(sBa, ratio, hBa)
    product(s, ratio, h)
  })

// Part 1
const [
  barometerHeight,
  barometerShadow,
  buildingHeight,
  buildingShadow,
] = cells(4)

similarTriangles(
  barometerShadow,
  barometerHeight,
  buildingShadow,
  buildingHeight
)

addContent(Interval(54.9, 55.1), buildingShadow)
addContent(Interval(0.3, 0.32), barometerHeight)
addContent(Interval(0.36, 0.37), barometerShadow)

// Part 2
const fallTime = Cell()
fallDuration(fallTime, buildingHeight)

addContent(Interval(2.9, 3.1), fallTime)

console.log("Building height", content(buildingHeight))
console.log("Baro height", content(barometerHeight))
console.log("Fall time", content(fallTime))
