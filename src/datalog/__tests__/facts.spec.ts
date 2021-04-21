/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch"
import { Showable, content, Cell, show } from "../../index"
import { query, Facts, in_ } from "../index"
import { includes } from "../predicates"

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
      [$.id, "gender", "female"],
      [$.id, "name", $.names],
    ])(root)

    console.log("female senators", show.call(content(names)))

    const { twitters } = query($ => [
      [$.id, "state", "OR"],
      [$.id, "twitterid", $.twitters],
    ])(root)

    console.log("OR twitters", show.call(content(twitters)))

    const { state } = query($ => [
      [$.id, "party", in_(["Independent"])],
      [$.id, "state", $.state],
    ])(root)

    console.log("Independent states", show.call(content(state)))

    const { fullMikes } = query($ => [
      [$.id, "name", includes("Mike")],
      [$.id, "name", $.fullMikes],
    ])(root)

    console.log("Mikes", show.call(content(fullMikes)))
  })
})
