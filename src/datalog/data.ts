import { Cell } from "../cell"
import { Fact } from "./fact"
import { Facts } from "./facts"
import { query, Query } from "./queries"

class Data_<E = any, K extends string = string, V = any> {
  private cell = Cell(Facts<E, K, V>())

  constructor(facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = []) {
    this.addMany(facts)
  }

  get size(): number {
    return (this.cell.content as Facts<E, K, V>).size
  }

  add(fact: Fact<E, K, V>): void {
    this.addMany([fact])
  }

  addMany(facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>>): void {
    this.cell.addContent(Facts(facts))
  }

  // remove(fact: Fact<E, K, V>): void {
  //   // TODO:??
  //   // this.cell.remove?Content(Facts([fact]))
  // }

  query(
    fn: ($: Record<string, Cell<E | K | V>>) => Query[],
  ): Record<string, Cell<E | K | V>> {
    return query<E, K, V>(fn)(this.cell)
  }
}

export const isData = (value: unknown): value is Data => value instanceof Data_

export type Data<E = any, K extends string = string, V = any> = Data_<E, K, V>

export const Data = <E, K extends string, V>(
  facts: Array<Fact<E, K, V>> | Set<Fact<E, K, V>> = [],
) => new Data_(facts)
