import { T, equals } from "ramda"
import { merge, eq } from "./multimethods.mjs"
import { not } from "./util.mjs"

export const Nothing = Symbol("nothing")

// Check if a value is not equal to the special value "Nothing"
export const isAnything = T

// Check if a value is equal to the special value "Nothing"
export const isNothing = equals(Nothing)

merge
  .assign([isNothing, isNothing], () => Nothing)
  .assign([not(isNothing), isNothing], content => content)
  .assign([isNothing, not(isNothing)], (_, increment) => increment)

eq.assign([isAnything, isAnything], (a, b) => a === b)
