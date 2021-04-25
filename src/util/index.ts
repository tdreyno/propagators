export * from "./contridiction"
export * from "./showable"
export * from "./permutations"
export * from "./isPojo"

// Flip args
export const flip = <A, B, C>(fn: (a: A, b: B) => C) => (b: B, a: A) => fn(a, b)
