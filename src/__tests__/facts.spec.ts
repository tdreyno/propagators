/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch"
import {
  addContent,
  content,
  isCell,
  Cell,
  Facts,
  Showable,
  isAnything,
  constant,
  propagator,
  intersection,
  log,
  Fact,
  show,
} from "../index"

const DATA_SOURCE =
  "https://www.govtrack.us/api/v2/role?current=true&role_type=senator&limit=100"

const pojoToFacts = <O extends Record<string, any>>(
  obj: O,
  getId: (obj: O) => Showable,
): Facts<any, string, any> =>
  Object.entries(obj).reduce(
    (facts, [key, value]) => (facts.add(getId(obj), key, value), facts),
    Facts(),
  )

const EMPTY_SET = new Set<Fact>()

const lookupSet = <T>(
  rootFacts: Facts,
  set: Set<T>,
  getter: "entities" | "keys" | "values",
) =>
  Array.from(set)
    .map(t => rootFacts.lookup(getter as any, t) || EMPTY_SET)
    .reduce((acc, f) => Facts([...acc.facts, ...f]), Facts())

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

      if (getter === "values" && subSet.isEmpty()) {
        log("subSetFacts", subSet.facts)
      }

      Object.entries(notifiers).forEach(([key, value]) => {
        log(key, subSet.set(key as any))
        addContent(subSet.set(key as any), value!)
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

  return
  const output = Cell<Facts>()

  propagator(() => {
    const rootFacts = content(root)
    const e = content(eCell)
    const k = content(kCell)
    const v = content(vCell)

    if (
      isAnything(rootFacts) &&
      isAnything(e) &&
      isAnything(k) &&
      isAnything(v)
    ) {
      const eSubSet = lookupSet(rootFacts, e, "entities").facts
      const kSubSet = lookupSet(rootFacts, k, "keys").facts
      const vSubSet = lookupSet(rootFacts, v, "values").facts
      const possibilities = intersection(
        intersection(eSubSet, kSubSet),
        vSubSet,
      )

      addContent(Facts(possibilities), output)
    }
  }, [eCell, kCell, vCell])

  return output
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const query = (fn: ($: Record<string, Cell>) => Query[]) => (
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

describe("facts", () => {
  test("senators", async () => {
    const { objects } = await (await fetch(DATA_SOURCE)).json()

    const facts: Facts = objects.reduce((facts: Facts, obj: any) => {
      const { person, ...rest } = obj

      return facts.union(
        pojoToFacts({ ...rest, ...person }, () => person["cspanid"]),
      )
    }, Facts())

    // expect(facts.size()).toBe(170)

    // console.log(facts.facts)

    const root = Cell(facts)
    // const result = Cell<Facts>()

    // const byKey = (key: string) => (facts: Facts): Facts =>
    //   facts.lookup("keys", key)

    // root.map(byKey("name")).into(result)

    // if (!isNothing(result.content)) {
    //   // console.log(Array.from(result.content.facts).map(f => f.toString()))
    // }

    //
    // TODO: Figure out Sets with nulls
    //

    const { names } = query($ => [
      [$.id, "gender", "male"],
      [$.id, "name", $.names],
    ])(root)

    console.log("male names", show.call(content(names)))

    const { twitters } = query($ => [
      [$.id, "state", "OR"],
      [$.id, "twitterid", $.twitters],
    ])(root)

    console.log("OR twitters", show.call(content(twitters)))
  })
})
