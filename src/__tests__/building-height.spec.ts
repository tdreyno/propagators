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

describe.skip("building-height", () => {
  test("test", () => {
    const product = (x: Cell, y: Cell) => ({
      into: (total: Cell) => {
        multiplier(x, y).into(total)
        divider(total, x).into(y)
        divider(total, y).into(x)
      },
    })

    const quadratic = (x: Cell) => ({
      into: (xSquared: Cell) => {
        squarer(x).into(xSquared)
        squareRooter(xSquared).into(x)
      },
    })

    const fallDuration = (t: Cell, h: Cell) =>
      compoundPropagator(
        t,
        h,
      )(() => {
        const [tSquared, gtSquared] = cells(2)

        const g = constant(Interval(9.789, 9.832))
        const oneHalf = constant(1 / 2)

        quadratic(t).into(tSquared)
        product(g, tSquared).into(gtSquared)
        product(oneHalf, gtSquared).into(h)
      })

    const similarTriangles = (sBa: Cell, hBa: Cell, s: Cell, h: Cell) =>
      compoundPropagator(
        sBa,
        hBa,
        s,
      )(() => {
        const ratio = Cell()

        product(sBa, ratio).into(hBa)
        product(s, ratio).into(h)
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
    expect(content(barometerHeight)).toEqual({
      low: 0.3,
      high: 0.3183938287795994,
    })
    expect(content(fallTime)).toEqual({ low: 3.0091234174691017, high: 3.1 })
  })
})
