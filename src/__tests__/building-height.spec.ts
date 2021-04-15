import {
  multiplier,
  divider,
  squarer,
  squareRooter,
  compoundPropagator,
  constant,
  cells,
  addContent,
  Cell,
  content,
  Interval,
} from "../index"

describe("building-height", () => {
  test("test", () => {
    const product = (x: Cell, y: Cell) => (total: Cell) => {
      multiplier(x, y)(total)
      divider(total, x)(y)
      divider(total, y)(x)
    }

    const quadratic = (x: Cell) => (xSquared: Cell) => {
      squarer(x)(xSquared)
      squareRooter(xSquared)(x)
    }

    const fallDuration = (t: Cell, h: Cell) =>
      compoundPropagator(
        t,
        h,
      )(() => {
        const g = Cell<Interval>()
        const [oneHalf, tSquared, gtSquared] = cells(3)

        constant(Interval(9.789, 9.832))(g)
        constant(1 / 2)(oneHalf)
        quadratic(t)(tSquared)
        product(g, tSquared)(gtSquared)
        product(oneHalf, gtSquared)(h)
      })

    const similarTriangles = (sBa: Cell, hBa: Cell, s: Cell, h: Cell) =>
      compoundPropagator(
        sBa,
        hBa,
        s,
      )(() => {
        const ratio = Cell()

        product(sBa, ratio)(hBa)
        product(s, ratio)(h)
      })

    // Part 1
    const [
      barometerHeight,
      barometerShadow,
      buildingHeight,
      buildingShadow,
    ] = cells(4)

    similarTriangles(
      barometerShadow,
      barometerHeight,
      buildingShadow,
      buildingHeight,
    )

    addContent(Interval(54.9, 55.1), buildingShadow)
    addContent(Interval(0.3, 0.32), barometerHeight)
    addContent(Interval(0.36, 0.37), barometerShadow)

    // Part 2
    const fallTime = Cell()
    fallDuration(fallTime, buildingHeight)

    addContent(Interval(2.9, 3.1), fallTime)

    expect(content(buildingHeight)).toEqual({
      low: 44.51351351351351,
      high: 47.24276000000001,
    })
    // expect(content(barometerHeight)).toEqual({
    //   low: 0.3,
    //   high: 0.3183938287795994,
    // })
    // expect(content(fallTime)).toEqual({ low: 3.0091234174691017, high: 3.1 })
  })
})
