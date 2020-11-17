import { is } from "ramda"

const DEBUG = false

export const log = (...args) => {
  if (!DEBUG) {
    return
  }

  console.log(...args)
}

// Check if value is a number
export const isNumber = is(Number)

// Reverse predicate
export const not = fn => value => !fn(value)
