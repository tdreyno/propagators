import { Nothing, isNothing } from "./nothing"
import { merge, eq } from "./multimethods"
import { log, zipNWith, range } from "./util"

export type Neighbor = () => void

class Cell_<T = unknown> {
  neighbors = new Set<Neighbor>()

  constructor(public content: T | typeof Nothing = Nothing) {}

  map<R>(fn: (content: T) => R): { into(output: Cell<R>): void } {
    return zipNWith(fn)(this)
  }
}

// Make a new, empty cell. Must pass generic for future type.
export const Cell = <T>(content: T | typeof Nothing = Nothing) =>
  new Cell_<T>(content)
export type Cell<T = unknown> = Cell_<T>

export const cells = (num: number) => range(num).map(() => Cell<unknown>())

// Get the content of a cell.
export const content = <T>({ content }: Cell<T>) => content

// Cells are empty if their content is Nothing
export const isEmpty = ({ content }: Cell) => isNothing(content)

// Alert neighbords
const alertPropagators = (neighbors: Set<Neighbor>) =>
  neighbors.forEach(n => n())

// Add content to the cell.
export const addContent = <T>(content: T | typeof Nothing, cell: Cell<T>) => {
  log("Adding content", content)

  const answer = merge.call(cell.content, content) as T
  log("Merge", cell.content, content, answer)

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
