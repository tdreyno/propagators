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
  let data: Data

  beforeAll(() => {
    const { objects } = json

    const facts = objects.reduce((acc, obj: any) => {
      const { person, ...rest } = obj

      return union(
        acc,
        pojoToFacts({ ...rest, ...person }, () => person["bioguideid"]),
      )
    }, new Set<Fact>())

    data = Data(facts)
    expect(data.size).toBe(3464)
  })

  it("should perform simple queries", () => {
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
  })

  it("should update data when new facts are added", () => {
    const { state } = data.query($ => [
      [$.id, "party", in_(["Independent"])],
      [$.id, "state", $.state],
    ])

    expect(content(state)).toEqual(new Set(["VT", "ME"]))
    console.log("Independent states", show.call(content(state)))

    data.addMany([Fact(-1, "party", "Independent"), Fact(-1, "state", "??")])
    expect(data.size).toBe(3466)

    expect(content(state)).toEqual(new Set(["VT", "ME", "??"]))
    console.log("Independent states2", show.call(content(state)))
  })

  it("should query using predicates", () => {
    const { fullMikes } = data.query($ => [
      [$.id, "name", includes("Mike")],
      [$.id, "name", $.fullMikes],
    ])

    expect(Array.from(content(fullMikes) as Set<string>)).toHaveLength(4)
    console.log("Mikes", show.call(content(fullMikes)))
  })
})
