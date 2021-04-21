import { Nothing, isNothing } from "./datatypes/index"
import { merge, eq } from "./multimethods/index"
import { zipNWith } from "./propagators"
import { log } from "./log"

export type Neighbor = () => void

class Cell_<T = unknown> {
  neighbors = new Set<Neighbor>()

  constructor(public content: T | Nothing = Nothing) {}

  map<R>(fn: (content: T) => R): { into(output: Cell<R>): void } {
    log("map", fn)
    return zipNWith(fn)(this)
  }

  map2<B, R>(
    b: Cell<B>,
    fn: (a: T, b: B) => R,
  ): { into(output: Cell<R>): void } {
    log("map2", fn)
    return zipNWith(fn)(this, b)
  }

  map3<B, C, R>(
    b: Cell<B>,
    c: Cell<C>,
    fn: (a: T, b: B, c: C) => R,
  ): { into(output: Cell<R>): void } {
    log("map3", fn)
    return zipNWith(fn)(this, b, c)
  }
}

// Make a new, empty cell. Must pass generic for future type.
export const Cell = <T>(content: T | Nothing = Nothing) => new Cell_<T>(content)
export type Cell<T = unknown> = Cell_<T>

export const isCell = (v: unknown): v is Cell => v instanceof Cell_

export const cells = <T = unknown>(num: number) =>
  range(num).map(() => Cell<T>())

// Get the content of a cell.
export const content = <T>({ content }: Cell<T>) => content

// Cells are empty if their content is Nothing
export const isEmpty = ({ content }: Cell) => isNothing(content)

// Alert neighbords
const alertPropagators = (neighbors: Set<Neighbor>) =>
  neighbors.forEach(n => n())

// Add content to the cell.
export const addContent = <T>(content: T | Nothing, cell: Cell<T>) => {
  // log("Adding new content", content)

  const answer = merge.call(cell.content, content) as T
  log("Merge:", cell.content, "&", content, "=", answer)

  // if (isSet(content) && content.size === 0) {
  //   throw new Error("derp")
  // }

  if (eq.call(answer, cell.content)) {
    log("Was equal")
    return
  }

  log("Setting", answer)
  cell.content = answer
  alertPropagators(cell.neighbors)
}

export const addNeighbor = (neighbor: Neighbor) => (cell: Cell) => {
  cell.neighbors.add(neighbor)
  alertPropagators(new Set([neighbor]))
}

// Range of numbers
const range = (a: number, b = 0) =>
  Array(Math.abs(b - a))
    .fill(undefined)
    .map((_, i) => a + i)
