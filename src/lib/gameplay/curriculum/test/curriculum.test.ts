import { trivialCurriculum, trivialTask, twoPartCurriculum } from "./testutil"

test("curriculum.constructor", () => {
    expect(()=>{ trivialCurriculum() }).not.toThrow()
})

test("curriculum.recordScore", () => {
    let c = trivialCurriculum()
    expect(c.getScore(trivialTask())).toBe(0)

    c.recordScore(trivialTask(), 73)
    expect(c.getScore(trivialTask())).toBe(73)

    c.recordScore(trivialTask(), 100)
    expect(c.getScore(trivialTask())).toBe(100)

})

test("curriculum.locked", () => {
    let c = twoPartCurriculum()
    expect(c.unlocked(trivialTask(1,3))).toBe(false)

    c.recordScore(trivialTask(), 100)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
})

test("curriculum.next", () => {
    let c = twoPartCurriculum()
    expect(c.next().equals(trivialTask(1,2))).toBe(true)
    expect(c.next().equals(trivialTask(1,3))).toBe(false)

    c.recordScore(trivialTask(), 100)
    expect(c.next().equals(trivialTask(1,2))).toBe(false)
    expect(c.next().equals(trivialTask(1,3))).toBe(true)
})