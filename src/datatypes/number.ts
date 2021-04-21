import {
  add,
  divide,
  merge,
  multiply,
  square,
  squareRoot,
  subtract,
  show,
} from "../multimethods/index"

// Check if value is a number
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && isFinite(value)

add.assign([isNumber, isNumber], (x, y) => x + y)
merge.assign([isNumber, isNumber], (x, y) => x + y)
multiply.assign([isNumber, isNumber], (x, y) => x * y)
subtract.assign([isNumber, isNumber], (x, y) => x - y)
divide.assign([isNumber, isNumber], (x, y) => x / y)
square.assign([isNumber], x => x ** 2)
squareRoot.assign([isNumber], Math.sqrt)
show.assign([isNumber], a => a.toString())
