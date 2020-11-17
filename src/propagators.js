import {
  add,
  subtract,
  multiply,
  divide,
  square,
  squareRoot,
} from "./multimethods"
import { isNothing, Nothing } from "./nothing"
import { addNeighbor, isEmpty, content, addContent, Cell } from "./cell"
import { log } from "./util"

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

export const adder = functionToPropagator(add, "add(a, b)")
export const subtractor = functionToPropagator(subtract, "subtract(a, b)")
export const multiplier = functionToPropagator(multiply, "multiply(a, b)")
export const divider = functionToPropagator(divide, "divide(a, b)")
export const squarer = functionToPropagator(square, "square(a)")
export const squareRooter = functionToPropagator(squareRoot, "squareRoot(a)")

// A propagator that always returns the same value
export const constant = (content, output) =>
  functionToPropagator(a => a, `constant(${content})`)(Cell(content), output)

// if/else in propagator form
export const conditional = (p, ifTrue, ifFalse) => output =>
  propagator(() => {
    const predicate = content(p)

    if (isNothing(predicate)) {
      return
    }

    const result = content(predicate ? ifTrue : ifFalse)
    addContent(result, output)
  }, [p, ifTrue, ifFalse])

// Continue only if predicate is true
export const switch_ = (p, ifTrue) => conditional(p, ifTrue, Cell())

// Lazy network generator that doesn't run until it has
// one non-empty neighbor.
export const compoundPropagator = (...inputs) => {
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
