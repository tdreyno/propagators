import { range } from "../util"

describe("range", () => {
  test("should be range 5", () => {
    expect(range(5)).toHaveLength(5)
  })
})
