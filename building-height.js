const {
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
} = require("./pkg/dist-node/index.js")

const product = (x, y, total) => {
  multiplier(x, y, total)
  divider(total, x, y)
  divider(total, y, x)
}

const quadratic = (x, xSquared) => {
  squarer(x, xSquared)
  squareRooter(xSquared, x)
}

const fallDuration = (t, h) =>
  compoundPropagator(t, h, () => {
    const [g, oneHalf, tSquared, gtSquared] = cells(4)

    constant(Interval(9.789, 9.832), g)
    constant(1 / 2, oneHalf)
    quadratic(t, tSquared)
    product(g, tSquared, gtSquared)
    product(oneHalf, gtSquared, h)
  })

const similarTriangles = (sBa, hBa, s, h) =>
  compoundPropagator(sBa, hBa, s, () => {
    const ratio = Cell()

    product(sBa, ratio, hBa)
    product(s, ratio, h)
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

console.log("Building height", content(buildingHeight))
console.log("Baro height", content(barometerHeight))
console.log("Fall time", content(fallTime))
