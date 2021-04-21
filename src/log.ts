import { show } from "./multimethods"

const DEBUG = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (!DEBUG) {
    return
  }

  console.log(...args.map(a => show.call(a)))
}
