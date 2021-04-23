import { Maybe, Nothing, fromNullable } from "../datatypes/index"

export type Path = any[]

export class Trie<T> {
  values = new Map<any, any>()
  children = new Map<any, Trie<T> | T>()

  constructor(
    private valueFn: (acc: Map<any, any>, value: T) => Map<any, Set<T>>,
  ) {}

  add(value: T, path: Path): void {
    const [head, ...tail] = path

    this.values = this.valueFn(this.values, value)

    if (tail.length <= 0) {
      this.children.set(head, value)
      return
    }

    if (!this.children.has(head)) {
      this.children.set(head, new Trie(this.valueFn))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const trie = this.children.get(head)! as Trie<T>

    trie.add(value, tail)
  }

  get(path: Path): Maybe<Trie<T> | T> {
    const [head, ...tail] = path

    if (!this.children.has(head)) {
      return Nothing
    }

    if (tail.length <= 0) {
      return fromNullable(this.children.get(head))
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const trie = this.children.get(head)! as Trie<T>

    return trie.get(tail)
  }

  has(path: Path): boolean {
    const [head, ...tail] = path

    if (!this.children.has(head)) {
      return false
    }

    if (tail.length <= 0) {
      return true
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const trie = this.children.get(head)! as Trie<T>

    return trie.has(tail as Path)
  }

  clear() {
    this.values.clear()
    this.children.clear()
  }
}
