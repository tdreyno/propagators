import { merge, eq, show } from "../multimethods/index"

export class Nothing_ {}
export const Nothing = new Nothing_()
export type Nothing = Nothing_

// Check if a value is equal to the special value "Nothing"
export const isNothing = <T>(value: Nothing_ | T): value is Nothing_ =>
  value instanceof Nothing_

// Check if a value is not equal to the special value "Nothing"
export const isAnything = <T>(value: Nothing_ | T): value is T =>
  !isNothing(value)

merge
  .assign([isNothing, isNothing], () => Nothing)
  .assign([isAnything, isNothing], content => content)
  .assign([isNothing, isAnything], (_, increment) => increment)

eq.assign([isNothing, isNothing], () => true)
  .assign([isAnything, isNothing], () => false)
  .assign([isNothing, isAnything], () => false)
  .assign([isAnything, isAnything], (a, b) => a === b)

show.assign([isNothing], () => "Nothing")
