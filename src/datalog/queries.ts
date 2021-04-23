/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Facts } from "./facts"
import { addContent, Cell, content, isCell } from "../cell"
import { isAnything, union } from "../datatypes/index"
import { propagator, constant } from "../propagators"
import { Fact } from "./fact"
import { log } from "../log"

const EMPTY_SET = new Set<Fact>()

const lookupSet = <T>(
  rootFacts: Facts,
  set: Set<T>,
  getter: "entities" | "keys" | "values",
): Set<Fact<any, string, any>> =>
  Array.from(set)
    .map(t => rootFacts.lookup(getter as any, t) || EMPTY_SET)
    .reduce(union, new Set())

const relationship = <T, E, K, V>(
  root: Cell<Facts>,
  cell: Cell<Set<T>>,
  getter: "entities" | "keys" | "values",
  notifiers: {
    entities?: Cell<Set<E>>
    keys?: Cell<Set<K>>
    values?: Cell<Set<V>>
  },
) =>
  propagator(() => {
    const rootFacts = content(root) as Facts
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
        addContent(subFacts.set(key as any), value!)
      })
    }
  }, [root, cell])

class Placeholder_ {}
type Placeholder = Placeholder_

const isPlaceholder = (v: unknown): v is Placeholder =>
  v instanceof Placeholder_
// const _ = new Placeholder_()

const isValue = <T>(v: unknown): v is T => !isPlaceholder(v) && !isCell(v)

type Query<E = any, K extends string = string, V = any> = [
  e: E | Placeholder | Cell<Set<E>>,
  k: K | Placeholder | Cell<Set<K>>,
  v: V | Placeholder | Cell<Set<V>>,
]

const toCell = <T>(x: T | Placeholder | Cell<Set<T>>): Cell<Set<T>> => {
  if (isCell(x)) {
    return x
  }

  if (isValue<T>(x)) {
    return constant(
      new Set<T>([x]),
    )
  }

  return Cell<Set<T>>()
}

const Q = <E = any, K extends string = string, V = any>(
  e: E | Placeholder | Cell<Set<E>>,
  k: K | Placeholder | Cell<Set<K>>,
  v: V | Placeholder | Cell<Set<V>>,
  // ) => (root: Cell<Facts>): Cell<Facts> => {
) => (root: Cell<Facts>) => {
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

  // return
  // const output = Cell<Facts>()

  // propagator(() => {
  //   const rootFacts = content(root)
  //   const e = content(eCell)
  //   const k = content(kCell)
  //   const v = content(vCell)

  //   if (
  //     isAnything(rootFacts) &&
  //     isAnything(e) &&
  //     isAnything(k) &&
  //     isAnything(v)
  //   ) {
  //     const eSubSet = lookupSet(rootFacts, e, "entities").facts
  //     const kSubSet = lookupSet(rootFacts, k, "keys").facts
  //     const vSubSet = lookupSet(rootFacts, v, "values").facts
  //     const possibilities = intersection(
  //       intersection(eSubSet, kSubSet),
  //       vSubSet,
  //     )

  //     addContent(Facts(possibilities), output)
  //   }
  // }, [eCell, kCell, vCell])

  // return output
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const query = (fn: ($: Record<string, Cell>) => Query[]) => (
  root: Cell<Facts>,
): Record<string, Cell<unknown>> => {
  const $ = new Proxy<Record<string, Cell>>(
    {},
    {
      get: function (obj, prop: string) {
        if (!(prop in obj)) {
          obj[prop] = Cell()
        }

        return obj[prop]
      },
    },
  )

  fn($).forEach(q => Q(...q)(root))

  return $
}
