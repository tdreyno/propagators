/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch"
import { Cell, Facts, Showable } from "../index"
import { isNothing } from "../nothing"

const DATA_SOURCE =
  "https://www.govtrack.us/api/v2/role?current=true&role_type=senator&limit=10"

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

    const facts: Facts = objects.reduce(
      (facts: Facts, obj: any) =>
        facts.concat(
          pojoToFacts(obj["person"], () => obj["person"]["cspanid"]),
        ),
      Facts(),
    )

    expect(facts.size()).toBe(170)

    // console.log(facts.facts)

    const senators = Cell(facts)
    const result = Cell<Facts>()

    const byKey = (key: string) => (facts: Facts): Facts =>
      facts.lookupByKey(key)

    senators.map(byKey("name")).into(result)

    if (!isNothing(result.content)) {
      console.log(Array.from(result.content.facts).map(f => f.toString()))
    }
  })
})
