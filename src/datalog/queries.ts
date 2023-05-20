/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Facts } from "./facts"
import { addContent, Cell, content, isCell } from "../cell"
import { isAnything, unionMut } from "../datatypes/index"
import { propagator, constant } from "../propagators"
import { Fact } from "./fact"
import { log } from "../log"

const EMPTY_SET = new Set<Fact>()

const lookupSet = <E, K extends string, V>(
  rootFacts: Facts<E, K, V>,
  set: Set<E | K | V>,
  getter: "entities" | "keys" | "values",
): Set<Fact<E, K, V>> =>
  Array.from(set)
    .map(
      t =>
        (rootFacts.lookup(getter as any, t) || EMPTY_SET) as Set<Fact<E, K, V>>,
    )
    .reduce(unionMut, new Set())

const relationship = <E, K extends string, V, T extends E | K | V>(
  root: Cell<Facts<E, K, V>>,
  cell: Cell<Set<T>>,
  getter: "entities" | "keys" | "values",
  notifiers: {
    entities?: Cell<Set<E>>
    keys?: Cell<Set<K>>
    values?: Cell<Set<V>>
  },
) =>
  propagator(() => {
    const rootFacts = content(root) as Facts<E, K, V>
    const set = content(cell) as Set<T>

    if (isAnything(rootFacts) && isAnything(set)) {
      const subSet = lookupSet(rootFacts, set, getter)
      log(`relationship<${getter}>`, "root", rootFacts, set, subSet)

      if (getter === "values" && subSet.size <= 0) {
        log("subSetFacts", subSet)
      }

      const subFacts = Facts(subSet)

      Object.entries(notifiers).forEach(([key, value]) => {
        log(key, subFacts.set(key as any))
        addContent(subFacts.set(key as any), value as any)
      })
    }
  }, [root, cell])

class Placeholder_ {}
type Placeholder = Placeholder_

const isPlaceholder = (v: unknown): v is Placeholder =>
  v instanceof Placeholder_
// const _ = new Placeholder_()

const isValue = <T>(v: unknown): v is T => !isPlaceholder(v) && !isCell(v)

export type Query<E = any, K extends string = string, V = any> = [
  e: E | Placeholder | Cell<Set<E>>,
  k: K | Placeholder | Cell<Set<K>>,
  v: V | Placeholder | Cell<Set<V>>,
]

const toCell = <T>(x: T | Placeholder | Cell<Set<T>>): Cell<Set<T>> => {
  if (isCell(x)) {
    return x
  }

  if (isValue<T>(x)) {
    return constant(new Set<T>([x]))
  }

  return Cell<Set<T>>()
}

const Q =
  <E = any, K extends string = string, V = any>(
    e: E | Placeholder | Cell<Set<E>>,
    k: K | Placeholder | Cell<Set<K>>,
    v: V | Placeholder | Cell<Set<V>>,
    // ) => (root: Cell<Facts>): Cell<Facts> => {
  ) =>
  (root: Cell<Facts<E, K, V>>) => {
    // const result = Cell<Facts>()
    const eCell = toCell(e)
    const kCell = toCell(k)
    const vCell = toCell(v)

    relationship(root, eCell, "entities", {
      keys: kCell,
      values: vCell,
    })

    relationship(root, kCell, "keys", {
      entities: eCell,
      values: vCell,
    })

    relationship(root, vCell, "values", {
      entities: eCell,
      keys: kCell,
    })
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const query =
  <E = any, K extends string = string, V = any>(
    fn: ($: Record<string, Cell<E | K | V>>) => Query[],
  ) =>
  (root: Cell<Facts<E, K, V>>): Record<string, Cell<E | K | V>> => {
    const variables: Array<Cell<E | K | V>> = []

    const $ = new Proxy<Record<string, Cell<E | K | V>>>(
      {},
      {
        get: function (obj, prop: string) {
          if (!(prop in obj)) {
            obj[prop] = Cell()
            variables.push(obj[prop])
          }

          return obj[prop]
        },
      },
    )

    propagator(() => {
      variables.forEach(v => v.clear())
    }, [root])

    fn($).forEach(q => Q<E, K, V>(...q)(root))

    return $
  }
