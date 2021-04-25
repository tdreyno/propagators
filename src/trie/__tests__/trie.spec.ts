import { Trie } from "../trie"

describe("Trie", () => {
  const dataA = "a"
  const pathA = ["entities", 1, "keys", "test", "values", 2]

  const dataB = "b"
  const pathB = ["entities", 2, "keys", "test", "values", 3]

  it("should add items", () => {
    const t = new Trie(a => a)

    expect(t.children.size).toBe(0)
    expect(t.has(pathA)).toBe(false)

    t.add(dataA, pathA)

    expect(t.children.size).toBe(1)
    expect((t.children.get(pathA[0]) as any).children.size).toBe(1)
    expect(t.has(pathA)).toBe(true)

    const dataA_ = t.get(pathA).unwrap()
    expect(dataA_).toBe(dataA)

    t.add(dataB, pathB)

    expect(t.children.size).toBe(1)
    expect((t.children.get(pathA[0]) as any).children.size).toBe(2)
    expect(t.has(pathB)).toBe(true)

    const dataB_ = t.get(pathB).unwrap()
    expect(dataB_).toBe(dataB)

    const pathC = ["entities", 3, "keys", "test", "values", 4]
    expect(t.has(pathC)).toBe(false)
  })

  it("should remove items", () => {
    const t = new Trie(a => a)

    t.add(dataA, pathA)

    expect(t.children.size).toBe(1)

    t.remove(pathA)

    expect(t.children.size).toBe(0)

    t.add(dataA, pathA)

    expect(t.children.size).toBe(1)

    const dataC = "c"
    const pathC = ["keys", "test", "entities", 2, "values", 3]

    // Should no-op if no value is stored.
    t.remove(pathC)

    t.add(dataC, pathC)

    expect(t.children.size).toBe(2)

    t.remove(pathA)

    expect(t.children.size).toBe(1)
  })
})
