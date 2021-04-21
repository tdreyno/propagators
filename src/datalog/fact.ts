/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, show } from "../multimethods/index"

class Fact_<E, K extends string, V> {
  constructor(public entity: E, public key: K, public value: V) {}
}

export type Fact<E = any, K extends string = string, V = any> = Fact_<E, K, V>

const isFact = (value: unknown): value is Fact => value instanceof Fact_

const isEqualFact = (x: Fact, y: Fact): boolean =>
  !!eq.call(x.entity, y.entity) &&
  x.key === y.key &&
  !!eq.call(x.value, y.value)

eq.assign([isFact, isFact], isEqualFact)

export const Fact = <E, K extends string, V>(entity: E, key: K, value: V) =>
  new Fact_(entity, key, value)

show.assign(
  [isFact],
  ({ entity, key, value }) =>
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `Fact<${show.call(entity)}, ${show.call(key)}, ${show.call(value)}>`,
)
