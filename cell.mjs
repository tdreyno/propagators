import { range, prop, pipe, call } from "ramda"
import { Nothing, isNothing } from "./nothing.mjs"
import { merge, eq } from "./multimethods.mjs"
import { log } from "./util.mjs"

class Cell_ {
  constructor(content = Nothing) {
    this.content = content
    this.neighbors = new Set()
  }
}

// Make a new, empty cell. Must pass generic for future type.
export const Cell = content => new Cell_(content)

export const cells = num => range(0, num).map(() => Cell())

// Get the content of a cell.
export const content = prop("content")

// Cells are empty if their content is Nothing
export const isEmpty = pipe(content, isNothing)

// Alert neighbords
const alertPropagators = neighbors => neighbors.forEach(call)

// Add content to the cell.
export const addContent = (content, cell) => {
  log("Adding content", content)

  const answer = merge(cell.content, content)
  log("Merge", cell.content, content, answer)

  if (eq(answer, cell.content)) {
    log("Was equal")
    return
  }

  log("Setting", answer)
  cell.content = answer
  alertPropagators(cell.neighbors)
}

export const addNeighbor = neighbor => cell => {
  cell.neighbors.add(neighbor)
  alertPropagators(new Set([neighbor]))
}
