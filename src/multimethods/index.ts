import { Multimethod } from "./multimethods"

export const add = new Multimethod("add")
export const eq = new Multimethod<boolean>("eq")
export const merge = new Multimethod("merge")
export const multiply = new Multimethod("multiply")
export const subtract = new Multimethod("subtract")
export const divide = new Multimethod("divide")
export const square = new Multimethod("square")
export const squareRoot = new Multimethod("squareRoot")
export const show = new Multimethod<string>("show")
