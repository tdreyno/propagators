/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, merge } from "./multimethods"
import { difference, intersection, Showable, union } from "./util"

class Fact_<E extends Showable, K extends string, V extends Showable> {
  constructor(public entity: E, public key: K, public value: V) {}

  toString(): string {
    return `Fact<${this.entity.toString()}, ${this.key.toString()}, ${this.value.toString()}>`
  }
}

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

class Facts_<E extends Showable, K extends string, V extends Showable> {
  public facts: Set<Fact<E, K, V>> = new Set()
  private entities: Map<E, Facts_<E, K, V>> = new Map()
  private keys: Map<K, Facts_<E, K, V>> = new Map()
  private values: Map<V, Facts_<E, K, V>> = new Map()
  private entitiesSet: Set<E> = new Set()
  private keysSet: Set<K> = new Set()
  private valuesSet: Set<V> = new Set()

  constructor(
    facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
    private readonly = false,
  ) {
    facts.forEach(this.addFact_)
  }

  toString(): string {
    return `Facts<${this.facts.size}>`
  }

  add(entity: E, key: K, value: V): Fact<E, K, V> {
    const found = this.get(entity, key, value)

    if (found !== undefined) {
      return found
    }

    return this.addFact_(new Fact_<E, K, V>(entity, key, value))
  }

  isEmpty(): boolean {
    return this.facts.size <= 0
  }

  first(): Fact<E, K, V> | undefined {
    return this.isEmpty() ? undefined : Array.from(this.facts)[0]
  }

  get(entity: E, key: K, value: V): Fact<E, K, V> | undefined {
    return this.lookup("entities", entity)
      .lookup("keys", key)
      .lookup("values", value)
      .first()
  }

  has(entity: E, key: K, value: V): boolean {
    return this.get(entity, key, value) !== undefined
  }

  size(): number {
    return this.facts.size
  }

  union(b: Facts<E, K, V>): Facts<E, K, V> {
    return Facts(union(this.facts, b.facts))
  }

  intersection(b: Facts<E, K, V>): Facts<E, K, V> {
    return Facts(intersection(this.facts, b.facts))
  }

  difference(b: Facts<E, K, V>): Facts<E, K, V> {
    return Facts(difference(this.facts, b.facts))
  }

  clear(): void {
    this.facts.clear()
    this.entities.clear()
    this.keys.clear()
    this.values.clear()
  }

  lookup(by: "entities", x: E): Facts_<E, K, V>
  lookup(by: "keys", x: K): Facts_<E, K, V>
  lookup(by: "values", x: V): Facts_<E, K, V>
  lookup(by: "entities" | "keys" | "values", x: any): Facts_<E, K, V> {
    let found: Facts<E, K, V> | undefined

    switch (by) {
      case "entities":
        found = this.entities.get(x)
        break
      case "keys":
        found = this.keys.get(x)
        break
      case "values":
        found = this.values.get(x)
        break
    }

    if (found !== undefined) {
      return found
    }

    return EMPTY_FACTS as any
  }

  set(by: "entities"): Set<E>
  set(by: "keys"): Set<K>
  set(by: "values"): Set<V>
  set(by: "entities" | "keys" | "values"): Set<E | K | V> {
    switch (by) {
      case "entities":
        return this.entitiesSet
      case "keys":
        return this.keysSet
      case "values":
        return this.valuesSet
    }
  }

  hasFact(fact: Fact<E, K, V>) {
    return this.facts.has(fact)
  }

  private addFact_ = (fact: Fact<E, K, V>): Fact<E, K, V> => {
    if (this.readonly) {
      throw new Error("Cannot add fact readonly Facts")
    }

    this.facts.add(fact)

    if (this.entities.has(fact.entity)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.entities.get(fact.entity)!.addFact_(fact)
    } else {
      this.entities.set(fact.entity, new Facts_())
    }

    if (this.keys.has(fact.key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.keys.get(fact.key)!.addFact_(fact)
    } else {
      this.keys.set(fact.key, new Facts_())
    }

    if (this.values.has(fact.value)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.values.get(fact.value)!.addFact_(fact)
    } else {
      this.values.set(fact.value, new Facts_())
    }

    return fact
  }
}

// Singleton
const EMPTY_FACTS = new Facts_(undefined, true)

export const Facts = <E extends Showable, K extends string, V extends Showable>(
  facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
) => new Facts_<E, K, V>(facts)

export type Facts<
  E extends Showable = any,
  K extends string = string,
  V extends Showable = any
> = Facts_<E, K, V>

const isFacts = (value: unknown): value is Facts => value instanceof Facts_

merge.assign([isFacts, isFacts], (a, b) => a.union(b))

// Singleton
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_FACTS = new Facts_<any, string, any>()

export const Fact = <E extends Showable, K extends string, V extends Showable>(
  entity: E,
  key: K,
  value: V,
) => ALL_FACTS.add(entity, key, value)
