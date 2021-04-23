const TIMES = 100000

const numbers = n =>
  Array(n)
    .fill(undefined)
    .map((_, i) => i)

const set = n =>
  new Set(numbers(n).map(() => Math.floor(Math.random() * 10000) - 10000 / 2))

const BASE = numbers(TIMES).map(() => set(Math.floor(Math.random() * 200)))

const cloneBase = () => [...BASE].map(s => new Set([...s]))

const sets = n => numbers(n).map(cloneBase)

const setEquality = (a, b) =>
  a.size === b.size && [...a].every(value => b.has(value))

const pairs = array =>
  array.reduce((result, _, index, array) => {
    if (index % 2 === 0) result.push(array.slice(index, index + 2))
    return result
  }, [])

const differenceMut = (a, b) => {
  for (const x of b) {
    if (b.has(x)) {
      a.delete(x)
    }
  }

  return a
}

const differenceCopy = (a, b) => {
  const output = new Set(a)
  differenceMut(output, b)
  return output
}

const differenceSpread = (a, b) => new Set([...a].filter(x => !b.has(x)))

const unionMut = (a, b) => {
  for (const x of b) {
    a.add(x)
  }

  return a
}

const unionCopy = (a, b) => {
  const output = new Set(a)
  unionMut(output, b)
  return output
}

const unionSpread = (a, b) => new Set([...a, ...b])

const intersectionMut = (a, b) => {
  for (const x of b) {
    if (!b.has(x)) {
      a.delete(x)
    }
  }

  return a
}

const intersectionCopy = (a, b) => {
  const output = new Set(a)
  intersectionMut(output, b)
  return output
}

const intersectionSpread = (a, b) => new Set([...a].filter(x => b.has(x)))

/**
 * union
 */

const [unionSetA, unionSetB, unionSetC] = sets(3)

console.time("unionMut")
const unionA = pairs(unionSetA).forEach(pair => unionMut(...pair))
console.timeEnd("unionMut")

console.time("unionCopy")
const unionB = pairs(unionSetB).forEach(pair => unionCopy(...pair))
console.timeEnd("unionCopy")

console.time("unionSpread")
const unionC = pairs(unionSetC).forEach(pair => unionSpread(...pair))
console.timeEnd("unionSpread")

/**
 * difference
 */

const [differenceSetA, differenceSetB, differenceSetC] = sets(3)

console.time("differenceMut")
const differenceA = pairs(differenceSetA).forEach(pair =>
  differenceMut(...pair),
)
console.timeEnd("differenceMut")

console.time("differenceCopy")
const differenceB = pairs(differenceSetB).forEach(pair =>
  differenceCopy(...pair),
)
console.timeEnd("differenceCopy")

console.time("differenceSpread")
const differenceC = pairs(differenceSetC).forEach(pair =>
  differenceSpread(...pair),
)
console.timeEnd("differenceSpread")

/**
 * intersection
 */

const [intersectionSetA, intersectionSetB, intersectionSetC] = sets(3)

console.time("intersectionMut")
const intersectionA = pairs(intersectionSetA).forEach(pair =>
  intersectionMut(...pair),
)
console.timeEnd("intersectionMut")

console.time("intersectionCopy")
const intersectionB = pairs(intersectionSetB).forEach(pair =>
  intersectionCopy(...pair),
)
console.timeEnd("intersectionCopy")

console.time("intersectionSpread")
const intersectionC = pairs(intersectionSetC).forEach(pair =>
  intersectionSpread(...pair),
)
console.timeEnd("intersectionSpread")
