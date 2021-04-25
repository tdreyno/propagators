import { Maybe, Nothing, fromNullable } from "../datatypes/index"

export type Path = any[]

export class Trie<T> {
  values = new Map<any, any>()
  children = new Map<any, Trie<T> | T>()

  constructor(
    private valueFn: (
      acc: Map<any, any>,
      value: T,
      mode: "add" | "remove",
    ) => Map<any, Set<T>>,
  ) {}

  add(value: T, path: Path): void {
    const [head, ...tail] = path

    this.values = this.valueFn(this.values, value, "add")

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

  remove(path: Path): boolean {
    const [head, ...tail] = path

    if (tail.length <= 0) {
      const value = this.children.get(head) as T
      this.values = this.valueFn(this.values, value, "remove")

      this.children.delete(head)

      return true
    }

    if (!this.children.has(head)) {
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const trie = this.children.get(head)! as Trie<T>

    const removed = trie.remove(tail)

    if (removed) {
      if (trie.children.size === 0) {
        this.children.delete(head)
        return true
      }

      return false
    }

    return false
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
