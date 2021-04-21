/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, show } from "./multimethods"
import { Showable } from "./showable"

class Fact_<E extends Showable, K extends string, V extends Showable> {
  constructor(public entity: E, public key: K, public value: V) {}
}

export type Fact<
  E extends Showable = any,
  K extends string = string,
  V extends Showable = any
> = Fact_<E, K, V>

const isFact = (value: unknown): value is Fact => value instanceof Fact_

const isEqualFact = (x: Fact, y: Fact): boolean =>
  !!eq.call(x.entity, y.entity) &&
  x.key === y.key &&
  !!eq.call(x.value, y.value)

eq.assign([isFact, isFact], isEqualFact)

export const Fact = <E extends Showable, K extends string, V extends Showable>(
  entity: E,
  key: K,
  value: V,
) => new Fact_(entity, key, value)

show.assign(
  [isFact],
  ({ entity, key, value }) =>
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `Fact<${show.call(entity)}, ${show.call(key)}, ${show.call(value)}>`,
)
