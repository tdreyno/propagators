import { addContent, cells } from "../cell"
import { adder } from "../propagators"

describe("propagators", () => {
  test("addition", () => {
    const [a, b, c] = cells(3)

    adder(a, b).into(c)

    addContent(1, a)
    addContent(2, b)

    expect(c.content).toBe(3)
  })
})
