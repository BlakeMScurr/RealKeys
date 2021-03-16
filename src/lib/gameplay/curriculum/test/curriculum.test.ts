import { modeFactory, modeName } from "../../mode/mode"
import { StrictCurriculum, splitByHand, splitByMode, splitBySection } from "../curriculum"
import { hand, NewTask } from "../task"
import { trivialCurriculum, trivialTask as newTask, twoPartCurriculum } from "./testutil"

test("curriculum.constructor", () => {
    expect(()=>{ trivialCurriculum() }).not.toThrow()
})

test("curriculum.getLessons", () => {
    expect(trivialCurriculum().getLessons()).toEqual(["mockTask"])
})

test("curriculum.getLesson", () => {
    expect(trivialCurriculum().getLesson("mockTask")).toEqual([{"endBar": 2, "hand": "Right", "lessonURL": "mockTask", "mode": {}, "startBar": 1, "methodology": "none"}])
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

test("curriculum.unlocked/basic", () => {
    let c = twoPartCurriculum()
    expect(c.unlocked(newTask(1,3))).toBe(false)

    c.recordScore(newTask(), 100)
    expect(c.unlocked(newTask(1,3))).toBe(true)
})

test("curriculum.unlocked/strict/linear", () => {
    // A -> B -> C
    let c = StrictCurriculum([
        newTask(1,2),
        newTask(1,3),
        newTask(1,4),
    ])

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

test("curriculum.unlocked/strict/fork", () => {
    // A ---v
    // B -> C
    let make = () => {
        return StrictCurriculum([
            newTask(1,2),
            newTask(2,3),
            newTask(1,3),
        ])
    }
    let c = make()

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(false)

    c.recordScore(newTask(1,2), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(false)

    c.recordScore(newTask(2,3), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(1,3))).toBe(true)
})

test("curriculum.unlocked/strict/wonkyfork", () => {
    // A --------v
    // B -> C -> D
    let make = () => {
        return StrictCurriculum([
            newTask(1,2), // A
            newTask(2,3), // B
            newTask(2,4), // C
            newTask(1,4), // D
        ])
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
    expect(c.unlocked(newTask(1,4))).toBe(false)

    c = make()
    c.recordScore(newTask(2,3), 100)

    expect(c.unlocked(newTask(1,2))).toBe(true)
    expect(c.unlocked(newTask(2,3))).toBe(true)
    expect(c.unlocked(newTask(2,4))).toBe(true)
    expect(c.unlocked(newTask(1,4))).toBe(false)
})

test("splitBySection", () => {
    let c = StrictCurriculum([
        newTask(1,2, hand.Left),
        newTask(1,2),
        newTask(1,3, hand.Left),
        newTask(1,3),
    ])

    expect(splitBySection(Array.from(c.getTasks().keys()))).toEqual([
        [
            newTask(1,2, hand.Left),
            newTask(1,2),
        ],[
            newTask(1,3, hand.Left),
            newTask(1,3),
        ]
    ])
})

test("splitbyHand", () => {
    let c = StrictCurriculum([
        newTask(1,2, hand.Left),
        newTask(1,2),
        newTask(1,3, hand.Left),
        newTask(1,3),
    ])

    expect(splitByHand(Array.from(c.getTasks().keys()))).toEqual([
        [
            newTask(1,2),
            newTask(1,3),
        ],[
            newTask(1,2, hand.Left),
            newTask(1,3, hand.Left),
        ]
    ])
})

test("splitbyMode", () => {
    let c = StrictCurriculum([
        newTask(3,4, hand.Right, modeFactory(modeName.atSpeed, 100)),
        newTask(1,2, hand.Right),
        newTask(4,5, hand.Right, modeFactory(modeName.atSpeed, 100)),
        newTask(2,3, hand.Right),
    ])

    expect(splitByMode(Array.from(c.getTasks().keys()))).toEqual([
        [
            newTask(1,2, hand.Right),
            newTask(2,3, hand.Right),
        ],
        [
            newTask(3,4, hand.Right, modeFactory(modeName.atSpeed, 100)),
            newTask(4,5, hand.Right, modeFactory(modeName.atSpeed, 100)),
        ]
    ])
})

test("minmax", () => {
    // A -> B
    // C -> D
    let twoTrack = StrictCurriculum([
        newTask(1,2), // A
        newTask(1,3), // B
        newTask(3,4), // C
        newTask(3,5), // D
    ])
    expect(twoTrack.minimalTasks()).toEqual([newTask(1,2), newTask(3,4)]) // A, C
    expect(twoTrack.maximalTasks()).toEqual([newTask(1,3), newTask(3,5)]) // B, D

    // A ---v
    // B -> C
    let fork = StrictCurriculum([
        newTask(1,2), // A
        newTask(2,3), // B
        newTask(1,3), // C
    ])
    expect(fork.minimalTasks()).toEqual([newTask(1,2), newTask(2,3)]) // A, B
    expect(fork.maximalTasks()).toEqual([newTask(1,3)]) // C

    // A --------v
    // B -> C -> D
    let wonky = StrictCurriculum([
        newTask(1,2), // A
        newTask(2,3), // B
        newTask(2,4), // C
        newTask(1,4), // D
    ])
    expect(wonky.minimalTasks()).toEqual([newTask(1,2), newTask(2,3)]) // A, B
    expect(wonky.maximalTasks()).toEqual([newTask(1,4)]) // D
})