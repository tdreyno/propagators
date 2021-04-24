export * from "./contridiction"
export * from "./showable"
export * from "./permutations"

// Flip args
export const flip = <A, B, C>(fn: (a: A, b: B) => C) => (b: B, a: A) => fn(a, b)
