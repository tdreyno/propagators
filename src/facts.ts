/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, merge } from "./multimethods"
import { Showable } from "./util"

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
  private byEntity_: Map<E, Facts_<E, K, V>> = new Map()
  private byKey_: Map<K, Facts_<E, K, V>> = new Map()
  private byValue_: Map<V, Facts_<E, K, V>> = new Map()

  constructor(facts: Array<Fact<E, K, V>> = [], private readonly = false) {
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

  has(entity: E, key: K, value: V): boolean {
    return !this.lookupByEntity(entity)
      .lookupByKey(key)
      .lookupByValue(value)
      .isEmpty()
  }

  get(entity: E, key: K, value: V): Fact<E, K, V> | undefined {
    return this.lookupByEntity(entity)
      .lookupByKey(key)
      .lookupByValue(value)
      .first()
  }

  first(): Fact<E, K, V> | undefined {
    return Array.from(this.facts)[0]
  }

  size(): number {
    return this.facts.size
  }

  concat<E2, K2 extends string, V2>(
    b: Facts<E2, K2, V2>,
  ): Facts<E | E2, K | K2, V | V2> {
    return Facts<E | E2, K | K2, V | V2>([...this.facts, ...b.facts])
  }

  clear(): void {
    this.facts.clear()
    this.byEntity_.clear()
    this.byKey_.clear()
    this.byValue_.clear()
  }

  lookupByEntity(entity: E): Facts_<E, K, V> {
    const found = this.byEntity_.get(entity)

    if (found !== undefined) {
      return found
    }

    return EMPTY_FACTS as any
  }

  lookupByKey(key: K): Facts_<E, K, V> {
    const found = this.byKey_.get(key)

    if (found !== undefined) {
      return found
    }

    return EMPTY_FACTS as any
  }

  lookupByValue(value: V): Facts_<E, K, V> {
    const found = this.byValue_.get(value)

    if (found !== undefined) {
      return found
    }

    return EMPTY_FACTS as any
  }

  hasFact(fact: Fact<E, K, V>) {
    return this.facts.has(fact)
  }

  private addFact_ = (fact: Fact<E, K, V>): Fact<E, K, V> => {
    if (this.readonly) {
      throw new Error("Cannot add fact readonly Facts")
    }

    this.facts.add(fact)

    if (this.byEntity_.has(fact.entity)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.byEntity_.get(fact.entity)!.addFact_(fact)
    } else {
      this.byEntity_.set(fact.entity, new Facts_())
    }

    if (this.byKey_.has(fact.key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.byKey_.get(fact.key)!.addFact_(fact)
    } else {
      this.byKey_.set(fact.key, new Facts_())
    }

    if (this.byValue_.has(fact.value)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.byValue_.get(fact.value)!.addFact_(fact)
    } else {
      this.byValue_.set(fact.value, new Facts_())
    }

    return fact
  }
}

// Singleton
const EMPTY_FACTS = new Facts_(undefined, true)

export const Facts = <E extends Showable, K extends string, V extends Showable>(
  facts: Array<Fact<E, K, V>> = [],
) => new Facts_<E, K, V>(facts)

export type Facts<
  E extends Showable = any,
  K extends string = string,
  V extends Showable = any
> = Facts_<E, K, V>

const isFacts = (value: unknown): value is Facts => value instanceof Facts_

merge.assign([isFacts, isFacts], (a, b) => a.concat(b))

// Singleton
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_FACTS = new Facts_<any, string, any>()

export const Fact = <E extends Showable, K extends string, V extends Showable>(
  entity: E,
  key: K,
  value: V,
) => ALL_FACTS.add(entity, key, value)
