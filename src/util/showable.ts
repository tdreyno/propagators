import { show } from "../multimethods/index"

export type Showable = {
  toString(): string
}

export const isShowable = (x: unknown): x is Showable =>
  x && (x as any)["toString"]

show
  // .assign([isShowable], a => a.toString())
  .assign([(a): a is null => a === null], () => "null")
  .assign([(a): a is undefined => a === undefined], () => "undefined")
