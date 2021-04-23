/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Showable, content, Cell, show } from "../../index"
import { query, Facts, in_, Fact } from "../index"
import { includes } from "../predicates"
import json from "./senators.json"

const pojoToFacts = <O extends Record<string, any>>(
  obj: O,
  getId: (obj: O) => Showable,
): Facts<any, string, any> =>
  Object.entries(obj).reduce(
    (facts, [key, value]) => (facts.add(Fact(getId(obj), key, value)), facts),
    Facts(),
  )

describe("facts", () => {
  test("senators", async () => {
    const { objects } = json

    const facts: Facts = objects.reduce((facts: Facts, obj: any) => {
      const { person, ...rest } = obj

      return facts.union(
        pojoToFacts({ ...rest, ...person }, () => person["bioguideid"]),
      )
    }, Facts())

    expect(facts.size).toBe(3464)

    const root = Cell(facts)

    //
    // TODO: Figure out Sets with nulls
    //

    const { names } = query($ => [
      [$.id, "gender", "female"],
      [$.id, "name", $.names],
    ])(root)

    expect(Array.from(content(names) as Set<string>)).toHaveLength(24)
    console.log("female senators", show.call(content(names)))

    const { twitters } = query($ => [
      [$.id, "state", "OR"],
      [$.id, "twitterid", $.twitters],
    ])(root)

    expect(content(twitters)).toEqual(new Set(["RonWyden", "SenJeffMerkley"]))
    console.log("OR twitters", show.call(content(twitters)))

    const { state } = query($ => [
      [$.id, "party", in_(["Independent"])],
      [$.id, "state", $.state],
    ])(root)

    expect(content(state)).toEqual(new Set(["VT", "ME"]))
    console.log("Independent states", show.call(content(state)))

    const { fullMikes } = query($ => [
      [$.id, "name", includes("Mike")],
      [$.id, "name", $.fullMikes],
    ])(root)

    expect(Array.from(content(fullMikes) as Set<string>)).toHaveLength(4)
    console.log("Mikes", show.call(content(fullMikes)))
  })
})
