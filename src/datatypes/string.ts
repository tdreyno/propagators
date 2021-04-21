import { show } from "../multimethods/index"

export const isString = (x: unknown): x is string =>
  Object.prototype.toString.call(x) === "[object String]"

show
  // .assign([isShowable], a => a.toString())
  .assign([isString], a => a)
