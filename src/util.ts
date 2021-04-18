import { isNothing, Nothing } from "./nothing"
import { addContent, Cell, content } from "./cell"
import { propagator } from "./propagators"

const DEBUG = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (!DEBUG) {
    return
  }

  console.log(...args)
}

// Check if value is a number
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && isFinite(value)

// Reverse predicate
export const not = <T>(fn: (value: T) => boolean) => (value: T) => !fn(value)

// Flip args
export const flip = <A, B, C>(fn: (a: A, b: B) => C) => (b: B, a: A) => fn(a, b)

// Range of numbers
export const range = (a: number, b = 0) =>
  Array(Math.abs(b - a))
    .fill(undefined)
    .map((_, i) => a + i)

const proto = Object.prototype
const gpo = Object.getPrototypeOf

export const isPojo = (obj: unknown) => {
  if (obj === null || typeof obj !== "object") {
    return false
  }

  return gpo(obj) === proto
}

export type Showable = {
  toString(): string
}

export const zipNWith = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
) => (...inputs: { [K in keyof Args]: Cell<Args[K]> }) => ({
  into(output: Cell<R>): void {
    propagator(() => {
      const values = inputs.map(content)
      log("\tHas values", values)

      const result = values.some(isNothing) ? Nothing : fn(...(values as Args))
      log("\tResult", result)

      addContent(result, output)
    }, inputs)
  },
})
