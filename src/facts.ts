/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, merge, show } from "./multimethods"
import { isNothing } from "./nothing"
import { Showable } from "./showable"
import { difference, intersection, isSet, union } from "./util"

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

class Facts_<E extends Showable, K extends string, V extends Showable> {
  public facts: Set<Fact<E, K, V>> = new Set()

  private entities: Set<E> = new Set()
  private keys: Set<K> = new Set()
  private values: Set<V> = new Set()

  private entitiesToFacts: Map<E, Set<Fact<E, K, V>>> = new Map()
  private keysToFacts: Map<K, Set<Fact<E, K, V>>> = new Map()
  private valuesToFacts: Map<V, Set<Fact<E, K, V>>> = new Map()

  private tree = new Map<
    "entities" | "keys" | "values",
    Map<
      E | K | V,
      Map<
        "entities" | "keys" | "values" | "all",
        Map<
          E | K | V,
          Map<"entities" | "keys" | "values", Map<E | K | V, Fact<E, K, V>>>
        >
      >
    >
  >()

  constructor(
    facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
    private readonly = false,
  ) {
    facts.forEach(this.addFact_)
  }

  add(entity: E, key: K, value: V): void {
    const found = this.get(entity, key, value)

    if (found !== undefined) {
      return
    }

    if (value === null || value === undefined) {
      return
    }

    this.addFact_(new Fact_<E, K, V>(entity, key, value))
  }

  isEmpty(): boolean {
    return this.facts.size <= 0
  }

  first(): Fact<E, K, V> | undefined {
    return this.isEmpty() ? undefined : Array.from(this.facts)[0]
  }

  get(entity: E, key: K, value: V): Fact<E, K, V> | undefined {
    return this.getPath("entities", entity, "keys", key, "values", value)
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
    this.tree.clear()
  }

  set(by: "entities"): Set<E>
  set(by: "keys"): Set<K>
  set(by: "values"): Set<V>
  set(by: "entities" | "keys" | "values"): Set<E | K | V> {
    switch (by) {
      case "entities":
        return this.entities
      case "keys":
        return this.keys
      case "values":
        return this.values
    }
  }

  lookup(by: "entities", e: E): Set<Fact<E, K, V>> | undefined
  lookup(by: "keys", k: K): Set<Fact<E, K, V>> | undefined
  lookup(by: "values", v: V): Set<Fact<E, K, V>> | undefined
  lookup(
    by: "entities" | "keys" | "values",
    x: E | K | V,
  ): Set<Fact<E, K, V>> | undefined {
    switch (by) {
      case "entities":
        return this.entitiesToFacts.get(x as E)
      case "keys":
        return this.keysToFacts.get(x as K)
      case "values":
        return this.valuesToFacts.get(x as V)
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

    this.entities.add(fact.entity)
    this.keys.add(fact.key)
    this.values.add(fact.value)

    if (!this.entitiesToFacts.has(fact.entity)) {
      this.entitiesToFacts.set(fact.entity, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.entitiesToFacts.get(fact.entity)!.add(fact)

    if (!this.keysToFacts.has(fact.key)) {
      this.keysToFacts.set(fact.key, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.keysToFacts.get(fact.key)!.add(fact)

    if (!this.valuesToFacts.has(fact.value)) {
      this.valuesToFacts.set(fact.value, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.valuesToFacts.get(fact.value)!.add(fact)

    const paths: Array<
      [
        a: "entities" | "keys" | "values",
        a1: E | K | V,
        b: "entities" | "keys" | "values",
        b1: E | K | V,
        c: "entities" | "keys" | "values",
        c1: E | K | V,
      ]
    > = [
      ["entities", fact.entity, "keys", fact.key, "values", fact.value],
      ["entities", fact.entity, "values", fact.value, "keys", fact.key],
      ["keys", fact.key, "entities", fact.entity, "values", fact.value],
      ["keys", fact.key, "values", fact.value, "entities", fact.entity],
      ["values", fact.value, "keys", fact.key, "entities", fact.entity],
      ["values", fact.value, "entities", fact.entity, "keys", fact.key],
    ]

    paths.forEach(path => {
      this.setPath(fact, ...path)
    })

    return fact
  }

  private getPath(
    a: "entities" | "keys" | "values",
    a1: E | K | V,
    b: "entities" | "keys" | "values",
    b1: E | K | V,
    c: "entities" | "keys" | "values",
    c1: E | K | V,
  ): Fact<E, K, V> | undefined {
    if (!this.tree.has(a)) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const one = this.tree.get(a)!.get(a1)

    if (!one) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const two = one.get(b)!.get(b1)

    if (!two) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return two.get(c)!.get(c1)
  }

  private setPath(
    fact: Fact<E, K, V>,
    a: "entities" | "keys" | "values",
    a1: E | K | V,
    b: "entities" | "keys" | "values",
    b1: E | K | V,
    c: "entities" | "keys" | "values",
    c1: E | K | V,
  ): void {
    if (!this.tree.has(a)) {
      this.tree.set(a, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.tree.get(a)!.has(a1)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree.get(a)!.set(a1, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.tree.get(a)!.get(a1)!.has(b)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree.get(a)!.get(a1)!.set(b, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.tree.get(a)!.get(a1)!.get(b)!.has(b1)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree.get(a)!.get(a1)!.get(b)!.set(b1, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.tree.get(a)!.get(a1)!.get(b)!.get(b1)!.has(c)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tree.get(a)!.get(a1)!.get(b)!.get(b1)!.set(c, new Map())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.tree.get(a)!.get(a1)!.get(b)!.get(b1)!.get(c)!.set(c1, fact)
  }
}

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
show.assign([isFacts], facts => `Facts<${facts.size()}>`)

// Singleton
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_FACTS = new Facts_<any, string, any>()

export const Fact = <E extends Showable, K extends string, V extends Showable>(
  entity: E,
  key: K,
  value: V,
) => ALL_FACTS.add(entity, key, value)

merge.assign([isSet, isSet], intersection)
merge.assign([isSet, isNothing], a => a)
merge.assign([isNothing, isSet], (_, b) => b)

// TODO: This has got to be slow?!
eq.assign(
  [isSet, isSet],
  (a, b) => a.size === b.size && [...a].every(value => b.has(value)),
)

show.assign(
  [isFact],
  ({ entity, key, value }) =>
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    `Fact<${show.call(entity)}, ${show.call(key)}, ${show.call(value)}>`,
)
