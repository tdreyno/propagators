import { show } from "../multimethods/index"
import { isPojo } from "./isPojo"

export type Showable = {
  toString(): string
}

export const isShowable = (x: unknown): x is Showable =>
  x && (x as any)["toString"]

const isBool = (x: unknown): x is boolean => x === true || x === false

show
  // .assign([isShowable], a => a.toString())
  .assign([(a): a is null => a === null], () => "null")
  .assign([(a): a is undefined => a === undefined], () => "undefined")
  .assign(
    [Array.isArray],
    arr => `Array<${arr.map(a => show.call(a)).join(", ")}>`,
  )
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  .assign([isBool], bool => "" + bool)
  .assign([isPojo], obj => JSON.stringify(obj))
