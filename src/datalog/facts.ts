import { eq, merge, show } from "../multimethods/index"
import {
  difference,
  equalsSet,
  intersection,
  isNothing,
  isSet,
  union,
} from "../datatypes/index"
import { Fact } from "./fact"
import { Path, Trie } from "../trie/index"
import { permutations } from "../util/index"

const EMPTY_SET = new Set<any>()

const factToPaths = (fact: Fact): Path[] =>
  permutations([
    ["entities", fact.entity],
    ["keys", fact.key],
    ["values", fact.value],
  ]).map(path => path.flat())

class Facts_<E, K extends string, V> {
  private trie: Trie<Fact<E, K, V>>

  constructor(facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = []) {
    // Setup Trie storage
    this.trie = new Trie((acc, f, mode) => {
      switch (mode) {
        case "add":
          // Add to all
          acc.set("all", (acc.get("all") || new Set()).add(f))

          // Add per-datum
          acc.set("entities", (acc.get("entities") || new Set()).add(f.entity))
          acc.set("keys", (acc.get("keys") || new Set()).add(f.key))
          acc.set("values", (acc.get("values") || new Set()).add(f.value))

          break

        case "remove":
          acc.has("all") && acc.set("all", acc.get("all").remove(f))
          acc.has("entities") &&
            acc.set("entities", acc.get("entities").remove(f.entity))
          acc.has("keys") && acc.set("keys", acc.get("entities").remove(f.key))
          acc.has("values") &&
            acc.set("values", acc.get("entities").remove(f.value))

          break
      }

      return acc
    })

    Array.from(facts).forEach(f => this.add(f))
  }

  add(fact: Fact<E, K, V>): void {
    if (fact.value === null || fact.value === undefined) {
      return
    }

    factToPaths(fact).forEach(path => this.trie.add(fact, path))
  }

  remove(fact: Fact<E, K, V>): void {
    factToPaths(fact).forEach(path => this.trie.remove(path))
  }

  update(from: Fact<E, K, V>, to: Fact<E, K, V>): void {
    this.remove(from)
    this.add(to)
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

  lookup(
    by: "entities" | "keys" | "values",
    x: E | K | V,
  ): Set<Fact<E, K, V>> | undefined {
    return this.trie.get([by, x]).fold(
      (x: any) => x.values.get("all"),
      () => undefined,
    )
  }

  get(entity: E, key: K, value: V): Fact<E, K, V> | undefined {
    return this.trie
      .get(["entities", entity, "keys", key, "values", value])
      .unwrap() as Fact<E, K, V> | undefined
  }

  get facts(): Set<Fact<E, K, V>> {
    const result = this.trie.values.get("all")

    if (result !== undefined) {
      return result
    }

    return EMPTY_SET
  }

  get size(): number {
    return this.facts.size
  }

  isEmpty(): boolean {
    return this.size <= 0
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

  set(by: "entities" | "keys" | "values"): Set<E | K | V> {
    const result = this.trie.values.get(by)

    if (result !== undefined) {
      return result
    }

    return EMPTY_SET
  }
}

export const Facts = <E, K extends string, V>(
  facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
) => new Facts_<E, K, V>(facts)

export type Facts<E = any, K extends string = string, V = any> = Facts_<E, K, V>

const isFacts = (value: unknown): value is Facts => value instanceof Facts_

merge.assign([isFacts, isFacts], (a, b) => a.union(b))
show.assign([isFacts], facts => `Facts<${facts.size}>`)

merge.assign([isSet, isSet], intersection)
merge.assign([isSet, isNothing], a => a)
merge.assign([isNothing, isSet], (_, b) => b)

eq.assign([isSet, isSet], equalsSet)
