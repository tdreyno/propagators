import { addContent, cells } from "../cell"
import { add } from "../multimethods/index"
import { zipNWith } from "../propagators"

export const adder = zipNWith(add.call)

describe("propagators", () => {
  test("addition", () => {
    const [a, b, c] = cells(3)

    adder(a, b).into(c)

    addContent(1, a)
    addContent(2, b)

    expect(c.content).toBe(3)
  })
})
