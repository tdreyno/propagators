class MultimethodError extends Error {
  constructor(name, args) {
    super(
      `No matching multimethod: ${name}(${args
        .map(a => a.toString())
        .join(", ")})`
    )
  }
}

export const Multimethod = (name = "Unknown") => {
  const overloads = []

  const baseFn = (...args) => {
    for (const [matcher, fn] of overloads) {
      if (args.every((arg, i) => matcher[i](arg))) {
        return fn(...args)
      }
    }

    throw new MultimethodError(name, args)
  }

  baseFn.assign = (matcher, fn) => {
    overloads.unshift([matcher, fn])
    return baseFn
  }

  return baseFn
}
