import {
  add,
  subtract,
  multiply,
  divide,
  square,
  squareRoot,
} from "./multimethods"
import { isNothing, Nothing } from "./nothing"
import {
  addNeighbor,
  isEmpty,
  content,
  addContent,
  Cell,
  Neighbor,
} from "./cell"
// import { log } from "./util"

export const propagator = (fn: Neighbor, inputs: Array<Cell>) =>
  inputs.forEach(addNeighbor(fn))

export const zipNWith = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
) => (...inputs: { [K in keyof Args]: Cell<Args[K]> }) => ({
  into(output: Cell<R>): void {
    propagator(() => {
      const values = inputs.map(content)
      // log("\tHas values", values)

      const result = values.some(isNothing) ? Nothing : fn(...(values as Args))
      // log("\tResult", result)

      addContent(result, output)
    }, inputs)
  },
})

export const adder = zipNWith(add.call)
export const subtractor = zipNWith(subtract.call)
export const multiplier = zipNWith(multiply.call)
export const divider = zipNWith(divide.call)
export const squarer = zipNWith(square.call)
export const squareRooter = zipNWith(squareRoot.call)

// A propagator that always returns the same value
export const constant = <T>(content: T): Cell<T> => Cell<T>(content)

// if/else in propagator form
export const conditional = <T>(
  p: Cell<boolean>,
  ifTrue: Cell<T>,
  ifFalse: Cell<T>,
) => (output: Cell<T>) =>
  propagator(() => {
    const predicate = content(p)

    if (isNothing(predicate)) {
      return
    }

    const result = content(predicate ? ifTrue : ifFalse)
    addContent(result, output)
  }, [p, ifTrue, ifFalse])

// Continue only if predicate is true
export const switch_ = <T>(p: Cell<boolean>, ifTrue: Cell<T>) =>
  conditional(p, ifTrue, Cell())

// Lazy network generator that doesn't run until it has
// one non-empty neighbor.
export const compoundPropagator = (...inputs: Array<Cell>) => (
  toBuild: () => void,
) => {
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
