import { eq } from "./multimethods"

class Fact_<E, K extends string, V> {
  constructor(public entity: E, public key: K, public value: V) {}
}

export const Fact = <E, K extends string, V>(entity: E, key: K, value: V) =>
  new Fact_<E, K, V>(entity, key, value)

export type Fact<E = unknown, K extends string = string, V = unknown> = Fact_<
  E,
  K,
  V
>

const isFact = (value: unknown): value is Fact => value instanceof Fact_

const isEqualFact = (x: Fact, y: Fact): boolean =>
  !!eq.call(x.entity, y.entity) &&
  x.key === y.key &&
  !!eq.call(x.value, y.value)

eq.assign([isFact, isFact], isEqualFact)
