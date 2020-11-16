class MultimethodError extends Error {
  constructor(name, args) {
    super(
      `No matching multimethod: ${name}(${args
        .map(a => a.toString())
        .join(", ")})`
    )
  }
}

const emptyMultimethod = name => (...args) => {
  throw new MultimethodError(name, args)
}

export const Multimethod = (
  name = "Unknown",
  baseFn = emptyMultimethod(name)
) => {
  baseFn.assign = (matcher, fn) => {
    return Multimethod(name, (...args) => {
      if (args.every((arg, i) => matcher[i](arg))) {
        return fn(...args)
      }

      return baseFn(...args)
    })
  }

  return baseFn
}
