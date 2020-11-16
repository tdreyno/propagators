import { equals } from "ramda"

const Contridiction = Symbol("contridiction")

export class ContridictionError extends Error {
  constructor() {
    super(Contridiction)
  }
}

// Check if a value is equal to the special value "Contridiction"
export const isContridiction = equals(Contridiction)
