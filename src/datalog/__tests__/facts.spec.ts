/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { union } from "../../datatypes"
import { show } from "../../multimethods/index"
import { Showable } from "../../util/index"
import { content } from "../../cell"
import { Fact } from "../fact"
import { includes, in_ } from "../predicates"
import { Data } from "../data"
import json from "./senators.json"

const pojoToFacts = <O extends Record<string, any>>(
  obj: O,
  getId: (obj: O) => Showable,
): Set<Fact> =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => acc.add(Fact(getId(obj), key, value)),
    new Set<Fact>(),
  )

describe("facts", () => {
  test("senators", async () => {
    const { objects } = json

    const facts = objects.reduce((acc, obj: any) => {
      const { person, ...rest } = obj

      return union(
        acc,
        pojoToFacts({ ...rest, ...person }, () => person["bioguideid"]),
      )
    }, new Set<Fact>())

    expect(facts.size).toBe(3800)

    const data = Data(facts)

    const { names } = data.query($ => [
      [$.id, "gender", "female"],
      [$.id, "name", $.names],
    ])

    expect(Array.from(content(names) as Set<string>)).toHaveLength(24)
    console.log("female senators", show.call(content(names)))

    const { twitters } = data.query($ => [
      [$.id, "state", "OR"],
      [$.id, "twitterid", $.twitters],
    ])

    expect(content(twitters)).toEqual(new Set(["RonWyden", "SenJeffMerkley"]))
    console.log("OR twitters", show.call(content(twitters)))

    const { state } = data.query($ => [
      [$.id, "party", in_(["Independent"])],
      [$.id, "state", $.state],
    ])

    expect(content(state)).toEqual(new Set(["VT", "ME"]))
    console.log("Independent states", show.call(content(state)))

    const { fullMikes } = data.query($ => [
      [$.id, "name", includes("Mike")],
      [$.id, "name", $.fullMikes],
    ])

    expect(Array.from(content(fullMikes) as Set<string>)).toHaveLength(4)
    console.log("Mikes", show.call(content(fullMikes)))
  })
})
