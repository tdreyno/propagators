const proto = Object.prototype
const gpo = Object.getPrototypeOf

// eslint-disable-next-line @typescript-eslint/ban-types
export const isPojo = (obj: unknown): obj is Record<string, unknown> => {
  if (obj === null || typeof obj !== "object") {
    return false
  }

  return gpo(obj) === proto
}
