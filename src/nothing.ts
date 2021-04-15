import { merge, eq } from "./multimethods"

export const Nothing = Symbol("nothing")

// Check if a value is equal to the special value "Nothing"
export const isNothing = (value: unknown): value is typeof Nothing =>
  value === Nothing

// Check if a value is not equal to the special value "Nothing"
export const isAnything = (value: unknown): value is unknown =>
  !isNothing(value)

merge
  .assign([isNothing, isNothing], () => Nothing)
  .assign([isAnything, isNothing], content => content)
  .assign([isNothing, isAnything], (_, increment) => increment)

eq.assign([isNothing, isNothing], () => true)
  .assign([isAnything, isNothing], () => false)
  .assign([isNothing, isAnything], () => false)
  .assign([isAnything, isAnything], (a, b) => a === b)
