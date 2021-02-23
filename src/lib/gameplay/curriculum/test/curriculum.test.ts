import { modeFactory, modeName } from "../../mode/mode"
import { curriculum, splitByHand, splitByMode, splitBySection, unlockCheckerFactory, UnlockCheckerType } from "../curriculum"
import { hand, task } from "../task"
import { trivialCurriculum, trivialTask as newTask, twoPartCurriculum } from "./testutil"

test("curriculum.constructor", () => {
    expect(()=>{ trivialCurriculum() }).not.toThrow()
})

test("curriculum.recordScore", () => {
    let c = trivialCurriculum()
    expect(c.getScore(newTask())).toBe(0)

    c.recordScore(newTask(), 73)
    expect(c.getScore(newTask())).toBe(73)

    c.recordScore(newTask(), 100)
    expect(c.getScore(newTask())).toBe(100)
})

test("curriculum.recordScore/backProp", () => {
    let c = twoPartCurriculum()
    expect(c.getScore(newTask(1,3))).toBe(0)

    c.recordScore(newTask(1,3), 73)
    expect(c.getScore(newTask())).toBe(0)
    expect(c.getScore(newTask(1,3))).toBe(73)

    c.recordScore(newTask(1,3), 100)
    expect(c.getScore(newTask())).toBe(100)
    expect(c.getScore(newTask(1,3))).toBe(100)
})

test("curriculum.next", () => {
    let c = twoPartCurriculum()
    expect(c.next().equals(newTask(1,2))).toBe(true)
    expect(c.next().equals(newTask(1,3))).toBe(false)

    c.recordScore(newTask(), 100)
    expect(c.next().equals(newTask(1,2))).toBe(false)
    expect(c.next().equals(newTask(1,3))).toBe(true)
})

test("curriculum.unlocked", () => {
    let c = twoPartCurriculum()
    expect(c.unlocked(newTask(1,3))).toBe(false)

    c.recordScore(newTask(), 100)
    expect(c.unlocked(newTask(2,3))).toBe(true)
})

test("curriculum.unlocked/lenient/linear", () => {
    // A -> B -> C
    let c = new curriculum([
        newTask(1,2),
        newTask(1,3),
        newTask(1,4),
    ], unlockCheckerFactory(UnlockCheckerType.Lenient))

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(false)
    expect(c.unlocked(newTask(1,4))).toBe(false)

    c.recordScore(newTask(1,2), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(true)
    expect(c.unlocked(newTask(1,4))).toBe(false)

    c.recordScore(newTask(1,3), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(true)
    expect(c.unlocked(newTask(1,4))).toBe(true)
})

test("curriculum.unlocked/lenient/fork", () => {
    // A ---v
    // B -> C
    let make = () => {
        return new curriculum([
            newTask(1,2),
            newTask(2,3),
            newTask(1,3),
        ], unlockCheckerFactory(UnlockCheckerType.Lenient))
    }
    let c = make()

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(false)

    c.recordScore(newTask(1,2), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(true)

    c = make()
    c.recordScore(newTask(2,3), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(true)
})

test("curriculum.unlocked/lenient/wonkyfork", () => {
    // A --------v
    // B -> C -> D
    let make = () => {
        return new curriculum([
            newTask(1,2), // A
            newTask(2,3), // B
            newTask(2,4), // C
            newTask(1,4), // D
        ], unlockCheckerFactory(UnlockCheckerType.Lenient))
    }
    let c = make()

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(2,4))).toBe(false)
    expect(c.unlocked(newTask(1,4))).toBe(false)
    
    c.recordScore(newTask(1,2), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(2,4))).toBe(false)
    expect(c.unlocked(newTask(1,4))).toBe(true)

    c = make()
    c.recordScore(newTask(2,3), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(2,4))).toBe(true)
    expect(c.unlocked(newTask(1,4))).toBe(false)
})

test("splitBySection", () => {
    let c = new curriculum([
        newTask(1,2, hand.Left),
        newTask(1,2),
        newTask(1,3, hand.Left),
        newTask(1,3),
    ], unlockCheckerFactory(UnlockCheckerType.Strict))

    expect(splitBySection(c.tasks.map((t)=>t.task))).toEqual([
        [
            {"endBar": 2, "hand": "Left", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
            {"endBar": 2, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1}
        ], 
        [
            {"endBar": 3, "hand": "Left", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
            {"endBar": 3, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1}
        ]
    ])
})

test("splitbyHand", () => {
    let c = new curriculum([
        newTask(1,2, hand.Left),
        newTask(1,2),
        newTask(1,3, hand.Left),
        newTask(1,3),
    ], unlockCheckerFactory(UnlockCheckerType.Strict))

    expect(splitByHand(c.tasks.map((t)=>t.task))).toEqual([
        [
            {"endBar": 2, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
            {"endBar": 3, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
        ], 
        [
            {"endBar": 2, "hand": "Left", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
            {"endBar": 3, "hand": "Left", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
        ]
    ])
})

test("splitbyMode", () => {
    let c = new curriculum([
        newTask(3,4, hand.Right, modeFactory(modeName.atSpeed, 100)),
        newTask(1,2, hand.Right),
        newTask(4,5, hand.Right, modeFactory(modeName.atSpeed, 100)),
        newTask(2,3, hand.Right),
    ], unlockCheckerFactory(UnlockCheckerType.Strict))

    expect(splitByMode(c.tasks.map((t)=>t.task))).toEqual([
        [
            {"endBar": 2, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 1},
            {"endBar": 3, "hand": "Right", "lessonURL": "mockTask", "mode": { "modeID": "wait"}, "startBar": 2}
        ], 
        [
            {"endBar": 4, "hand": "Right", "lessonURL": "mockTask", "mode": {"speed": 100, "modeID": "atSpeed100"}, "startBar": 3},
            {"endBar": 5, "hand": "Right", "lessonURL": "mockTask", "mode": {"speed": 100, "modeID": "atSpeed100"}, "startBar": 4}
        ]
    ])
})