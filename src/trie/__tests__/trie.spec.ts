import { Trie } from "../trie"

describe("Trie", () => {
  it("should work", () => {
    const t = new Trie(a => a)

    const dataA = "a"
    const pathA = ["entities", 1, "keys", "test", "values", 2]

    expect(t.children.size).toBe(0)
    expect(t.has(pathA)).toBe(false)

    t.add(dataA, pathA)

    expect(t.children.size).toBe(1)
    expect((t.children.get(pathA[0]) as any).children.size).toBe(1)
    expect(t.has(pathA)).toBe(true)

    const dataA_ = t.get(pathA).unwrap()
    expect(dataA_).toBe(dataA)

    const dataB = "b"
    const pathB = ["entities", 2, "keys", "test", "values", 3]

    t.add(dataB, pathB)

    expect(t.children.size).toBe(1)
    expect((t.children.get(pathA[0]) as any).children.size).toBe(2)
    expect(t.has(pathB)).toBe(true)

    const dataB_ = t.get(pathB).unwrap()
    expect(dataB_).toBe(dataB)

    const pathC = ["entities", 3, "keys", "test", "values", 4]
    expect(t.has(pathC)).toBe(false)
  })
})
