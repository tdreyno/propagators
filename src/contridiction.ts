const Contridiction = Symbol("contridiction")

export class ContridictionError extends Error {
  constructor() {
    super(Contridiction.toString())
  }
}

// Check if a value is equal to the special value "Contridiction"
export const isContridiction = (
  value: unknown,
): value is typeof Contridiction => value === Contridiction
