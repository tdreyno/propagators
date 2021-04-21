import { show } from "./multimethods/index"

const DEBUG = false

export const log = (...args: any[]) => {
  if (!DEBUG) {
    return
  }

  console.log(...args.map(a => show.call(a)))
}
