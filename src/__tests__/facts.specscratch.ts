// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import fetch from "node-fetch"
// import { addContent, content, isCell } from "../cell"
// import { Cell, Facts, Showable } from "../index"
// import { isAnything, isNothing } from "../nothing"
// import { compoundPropagator, propagator } from "../propagators"

// const DATA_SOURCE =
//   "https://www.govtrack.us/api/v2/role?current=true&role_type=senator&limit=10"

// const pojoToFacts = <O extends Record<string, any>>(
//   obj: O,
//   getId: (obj: O) => Showable,
// ): Facts<any, string, any> =>
//   Object.entries(obj).reduce(
//     (facts, [key, value]) => (facts.add(getId(obj), key, value), facts),
//     Facts(),
//   )

// describe("facts", () => {
//   test("senators", async () => {
//     const { objects } = await (await fetch(DATA_SOURCE)).json()

//     const facts: Facts = objects.reduce(
//       (facts: Facts, obj: any) =>
//         facts.union(pojoToFacts(obj["person"], () => obj["person"]["cspanid"])),
//       Facts(),
//     )

//     expect(facts.size()).toBe(170)

//     // console.log(facts.facts)

//     const root = Cell(facts)
//     const result = Cell<Facts>()

//     const byKey = (key: string) => (facts: Facts): Facts =>
//       facts.lookup("keys", key)

//     root.map(byKey("name")).into(result)

//     class Placeholder_ {}
//     type Placeholder = Placeholder_

//     const isPlaceholder = (v: unknown): v is Placeholder =>
//       v instanceof Placeholder_
//     const _ = new Placeholder_()

//     const isValue = <T>(v: unknown): v is T => !isPlaceholder(v) && !isCell(v)

//     type Query<E = any, K extends string = string, V = any> = [
//       e: E | Placeholder | Cell<Set<E>>,
//       k: K | Placeholder | Cell<Set<K>>,
//       v: V | Placeholder | Cell<Set<V>>,
//     ]

//     const E__ = new Map<any, Cell<Facts>>()
//     const _K_ = new Map<any, Cell<Facts>>()
//     const __V = new Map<any, Cell<Facts>>()

//     const getOrSet1 = (
//       a: any,
//       fn: (f: Facts) => Facts,
//       m: Map<any, Cell<Facts>>,
//     ): Cell<Facts> => {
//       if (m.has(a)) {
//         return m.get(a)!
//       }

//       const result = Cell<Facts>()
//       root.map(fn).into(result)

//       m.set(a, result)

//       return result
//     }

//     const EK_ = new Map<any, Map<any, Cell<Facts>>>()
//     const E_V = new Map<any, Map<any, Cell<Facts>>>()
//     const _KV = new Map<any, Map<any, Cell<Facts>>>()

//     const getOrSet2 = (
//       a: any,
//       b: any,
//       fn: (f: Facts) => Facts,
//       m: Map<any, Map<any, Cell<Facts>>>,
//     ): Cell<Facts> => {
//       if (m.has(a)) {
//         if (m.get(a)!.has(b)) {
//           return m.get(a)!.get(b)!
//         }
//       }

//       const result = Cell<Facts>()
//       root.map(fn).into(result)

//       if (m.has(a)) {
//         m.get(a)!.set(b, result)
//       } else {
//         m.set(a, new Map([b, result]))
//       }

//       return result
//     }

//     const EKV = new Map<any, Map<any, Map<any, Cell<Facts>>>>()

//     const getOrSet3 = (
//       a: any,
//       b: any,
//       c: any,
//       fn: (f: Facts) => Facts,
//       m: Map<any, Map<any, Map<any, Cell<Facts>>>>,
//     ): Cell<Facts> => {
//       if (m.has(a)) {
//         if (m.get(a)!.has(b)) {
//           if (m.get(a)!.get(b)!.has(c)) {
//             return m.get(a)!.get(b)!.get(c)!
//           }
//         }
//       }

//       const result = Cell<Facts>()
//       root.map(fn).into(result)

//       if (m.has(a)) {
//         if (m.get(a)!.has(b)) {
//           m.get(a)!.get(b)!.set(c, result)
//         } else {
//           m.get(a)!.set(b, new Map([c, result]))
//         }
//       } else {
//         m.set(a, new Map([b, new Map([c, result])]))
//       }

//       return result
//     }

//     const Q = <E = any, K extends string = string, V = any>(
//       e: E | Placeholder | Cell<Set<E>>,
//       k: K | Placeholder | Cell<Set<K>>,
//       v: V | Placeholder | Cell<Set<V>>,
//     ): Cell<Facts> => {
//       // E _ _
//       if (isValue<E>(e) && isPlaceholder(k) && isPlaceholder(v)) {
//         return getOrSet1(e, f => f.lookup("entities", e), E__)
//       }

//       // _ K _
//       if (isPlaceholder(e) && isValue<K>(k) && isPlaceholder(v)) {
//         return getOrSet1(k, f => f.lookup("keys", k), _K_)
//       }

//       // _ _ V
//       if (isPlaceholder(e) && isPlaceholder(k) && isValue<V>(v)) {
//         return getOrSet1(v, f => f.lookup("values", v), __V)
//       }

//       // E K _
//       if (isValue<E>(e) && isValue<K>(k) && isPlaceholder(v)) {
//         return getOrSet2(
//           e,
//           k,
//           f => f.lookup("entities", e).lookup("keys", k),
//           EK_,
//         )
//       }

//       // E _ V
//       if (isValue<E>(e) && isPlaceholder(k) && isValue<V>(v)) {
//         return getOrSet2(
//           e,
//           v,
//           f => f.lookup("entities", e).lookup("values", v),
//           E_V,
//         )
//       }

//       // _ K V
//       if (isPlaceholder(e) && isValue<K>(k) && isValue<V>(v)) {
//         return getOrSet2(
//           k,
//           v,
//           f => f.lookup("keys", k).lookup("values", v),
//           _KV,
//         )
//       }

//       // $ K V
//       if (isCell(e) && isValue<K>(k) && isValue<V>(v)) {
//         const output = Cell<Facts>()

//         const $KV = getOrSet2(
//           k,
//           v,
//           f => f.lookup("keys", k).lookup("values", v),
//           _KV,
//         )

//         // _ === Bottom type (empty set), we know nothing

//         // [Cell<E>, constant<K>, constant<V>]

//         propagator(() => {
//           const facts = content($KV)

//           if (isAnything(facts)) {
//             addContent(facts.set("entities"), e)
//           }
//         }, [e, $KV])

//         return output
//       }

//       // E K V
//       if (isValue<E>(e) && isValue<K>(k) && isValue<V>(v)) {
//         return getOrSet3(
//           e,
//           k,
//           v,
//           f => f.lookup("entities", e).lookup("keys", k).lookup("values", v),
//           EKV,
//         )
//       }

//       // _ _ _
//       // if (isPlaceholder(e) && isPlaceholder(k) && isPlaceholder(v)) {
//       return root
//       // }
//     }

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const query = (...statements: Query[]): void => {
//       return statements.forEach(q => Q(...q))
//     }

//     const $ = new Proxy<Record<string, Cell>>(
//       {},
//       {
//         get: function (obj, prop: string) {
//           if (!(prop in obj)) {
//             obj[prop] = Cell()
//           }

//           return obj[prop]
//         },
//       },
//     )

//     query([$.id, _, _], [$.id, "gender", "male"], [$.id, "name", $.name])

//     if (!isNothing(result.content)) {
//       // console.log(Array.from(result.content.facts).map(f => f.toString()))
//     }
//   })
// })
