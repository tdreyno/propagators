import { eq, merge, show } from "../multimethods/index"
import {
  difference,
  intersection,
  isNothing,
  isSet,
  union,
} from "../datatypes/index"
import { Fact } from "./fact"
import { Path, Trie } from "./trie"

const factToPaths = (fact: Fact): Path[] => [
  ["entities", fact.entity, "keys", fact.key, "values", fact.value],
  ["entities", fact.entity, "values", fact.value, "keys", fact.key],
  ["keys", fact.key, "entities", fact.entity, "values", fact.value],
  ["keys", fact.key, "values", fact.value, "entities", fact.entity],
  ["values", fact.value, "keys", fact.key, "entities", fact.entity],
  ["values", fact.value, "entities", fact.entity, "keys", fact.key],
]

class Facts_<E, K extends string, V> {
  private trie: Trie<Fact<E, K, V>>

  constructor(facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = []) {
    // Setup Trie storage
    this.trie = new Trie((acc, f) => {
      // Add to all
      acc.set("all", (acc.get("all") || new Set()).add(f))

      // Add per-datum
      acc.set("entities", (acc.get("entities") || new Set()).add(f.entity))
      acc.set("keys", (acc.get("keys") || new Set()).add(f.key))
      acc.set("values", (acc.get("values") || new Set()).add(f.value))

      return acc
    })

    facts.forEach(this.add.bind(this))
  }

  add(fact: Fact<E, K, V>): void {
    // TODO: Should null/undefined be allowed?
    if (fact.value === null || fact.value === undefined) {
      return
    }

    factToPaths(fact).forEach(path => this.trie.add(fact, path))
  }

  has(fact: Fact): boolean {
    return this.trie.has([
      "entities",
      fact.entity,
      "keys",
      fact.key,
      "values",
      fact.value,
    ])
  }

  lookup(by: "entities", e: E): Set<Fact<E, K, V>> | undefined
  lookup(by: "keys", k: K): Set<Fact<E, K, V>> | undefined
  lookup(by: "values", v: V): Set<Fact<E, K, V>> | undefined
  lookup(
    by: "entities" | "keys" | "values",
    x: E | K | V,
  ): Set<Fact<E, K, V>> | undefined {
    return this.trie.get(by, x).mapBoth(
      (x: any) => x.values,
      () => undefined,
    )
  }

  get(entity: E, key: K, value: V): Fact<E, K, V> | undefined {
    return this.trie
      .get("entities", entity, "keys", key, "values", value)
      .unwrap() as Fact<E, K, V> | undefined
  }

  isEmpty(): boolean {
    return this.size() <= 0
  }

  size(): number {
    return this.trie.values.size
  }

  get facts(): Set<Fact<E, K, V>> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.trie.values.get("all")!
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
    this.trie.clear()
  }

  set(by: "entities"): Set<E>
  set(by: "keys"): Set<K>
  set(by: "values"): Set<V>
  set(by: "entities" | "keys" | "values"): Set<E | K | V> {
    return this.trie.values.get(by)
  }
}

export const Facts = <E, K extends string, V>(
  facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
) => new Facts_<E, K, V>(facts)

export type Facts<E = any, K extends string = string, V = any> = Facts_<E, K, V>

const isFacts = (value: unknown): value is Facts => value instanceof Facts_

merge.assign([isFacts, isFacts], (a, b) => a.union(b))
show.assign([isFacts], facts => `Facts<${facts.size()}>`)

merge.assign([isSet, isSet], intersection)
merge.assign([isSet, isNothing], a => a)
merge.assign([isNothing, isSet], (_, b) => b)

// TODO: This has got to be slow?!
eq.assign(
  [isSet, isSet],
  (a, b) => a.size === b.size && [...a].every(value => b.has(value)),
)
