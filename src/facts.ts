import { merge } from "./multimethods"
import { Fact } from "./fact"

class Facts_<E, K extends string, V> {
  facts: Set<Fact<E, K, V>> = new Set()

  private byEntity: Map<E, Set<Fact<E, K, V>>> = new Map()
  private byKey: Map<K, Set<Fact<E, K, V>>> = new Map()
  private byValue: Map<V, Set<Fact<E, K, V>>> = new Map()

  constructor(facts: Array<Fact<E, K, V>>) {
    facts.forEach(this.add.bind(this))
  }

  add(fact: Fact<E, K, V>) {
    this.facts.add(fact)

    if (!this.byEntity.has(fact.entity)) {
      this.byEntity.set(fact.entity, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.byEntity.get(fact.entity)!.add(fact)

    if (!this.byKey.has(fact.key)) {
      this.byKey.set(fact.key, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.byKey.get(fact.key)!.add(fact)

    if (!this.byValue.has(fact.value)) {
      this.byValue.set(fact.value, new Set())
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.byValue.get(fact.value)!.add(fact)
  }

  filterByEntity(entity: E): Set<Fact<E, K, V>> {
    return this.byEntity.get(entity) ?? new Set<Fact<E, K, V>>()
  }

  filterByKey(key: K): Set<Fact<E, K, V>> {
    return this.byKey.get(key) ?? new Set<Fact<E, K, V>>()
  }

  filterByValue(value: V): Set<Fact<E, K, V>> {
    return this.byValue.get(value) ?? new Set<Fact<E, K, V>>()
  }
}

export const Facts = <E, K extends string, V>(facts: Array<Fact<E, K, V>>) =>
  new Facts_<E, K, V>(facts)

export type Facts<E = unknown, K extends string = string, V = unknown> = Facts_<
  E,
  K,
  V
>

const isFacts = (value: unknown): value is Facts => value instanceof Facts_

merge.assign([isFacts, isFacts], (a, b) => Facts([...a.facts, ...b.facts]))
