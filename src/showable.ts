import { show } from "./multimethods"
import { isNumber, isSet, isString } from "./util"

export type Showable = {
  toString(): string
}

export const isShowable = (x: unknown): x is Showable =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x && (x as any)["toString"]

show
  // .assign([isShowable], a => a.toString())
  .assign([isString], a => a)
  .assign([isNumber], a => a.toString())
  .assign(
    [isSet],
    set =>
      `Set<${Array.from(set)
        .map(a => show.call(a))
        .join(", ")}>`,
  )
