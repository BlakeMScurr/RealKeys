import { curriculum, unlockCheckerFactory, UnlockCheckerType } from "../curriculum"
import { task } from "../task"
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

test("curriculum.next", () => {
    let c = twoPartCurriculum()
    expect(c.next().equals(trivialTask(1,2))).toBe(true)
    expect(c.next().equals(trivialTask(1,3))).toBe(false)

    c.recordScore(trivialTask(), 100)
    expect(c.next().equals(trivialTask(1,2))).toBe(false)
    expect(c.next().equals(trivialTask(1,3))).toBe(true)
})

test("curriculum.unlocked", () => {
    let c = twoPartCurriculum()
    expect(c.unlocked(trivialTask(1,3))).toBe(false)

    c.recordScore(trivialTask(), 100)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
})

test("curriculum.unlocked/lenient/linear", () => {
    // A -> B -> C
    let c = new curriculum([
        trivialTask(1,2),
        trivialTask(1,3),
        trivialTask(1,4),
    ], unlockCheckerFactory(UnlockCheckerType.Lenient))

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(false)
    expect(c.unlocked(trivialTask(1,4))).toBe(false)

    c.recordScore(trivialTask(1,2), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(true)
    expect(c.unlocked(trivialTask(1,4))).toBe(false)

    c.recordScore(trivialTask(1,3), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(true)
    expect(c.unlocked(trivialTask(1,4))).toBe(true)
})

test("curriculum.unlocked/lenient/fork", () => {
    // A ---v
    // B -> C
    let make = () => {
        return new curriculum([
            trivialTask(1,2),
            trivialTask(2,3),
            trivialTask(1,3),
        ], unlockCheckerFactory(UnlockCheckerType.Lenient))
    }
    let c = make()

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(false)

    c.recordScore(trivialTask(1,2), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(true)

    c = make()
    c.recordScore(trivialTask(2,3), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(1,3))).toBe(true)
})

test("curriculum.unlocked/lenient/wonkyfork", () => {
    // A --------v
    // B -> C -> D
    let make = () => {
        return new curriculum([
            trivialTask(1,2), // A
            trivialTask(2,3), // B
            trivialTask(2,4), // C
            trivialTask(1,4), // D
        ], unlockCheckerFactory(UnlockCheckerType.Lenient))
    }
    let c = make()

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(2,4))).toBe(false)
    expect(c.unlocked(trivialTask(1,4))).toBe(false)
    
    c.recordScore(trivialTask(1,2), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(2,4))).toBe(false)
    expect(c.unlocked(trivialTask(1,4))).toBe(true)

    c = make()
    c.recordScore(trivialTask(2,3), 100)

    expect(c.unlocked(trivialTask(1,2))).toBe(true)
    expect(c.unlocked(trivialTask(2,3))).toBe(true)
    expect(c.unlocked(trivialTask(2,4))).toBe(true)
    expect(c.unlocked(trivialTask(1,4))).toBe(false)
})