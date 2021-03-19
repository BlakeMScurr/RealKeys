// TODO: prevent double testing. When we import something from the other test suites, it

import { hand, makeHand, urlToTask, handEqualOrHarder, NewTask } from "../task"
import { trivialTask } from "./testutil"

test("task.equals", () => {
    expect(trivialTask().equals(trivialTask())).toBe(true)
    expect(trivialTask(1,3).equals(trivialTask())).toBe(false)
})

test("task.equalOrHarder", () => {
    expect(trivialTask().equalOrHarder(trivialTask())).toBe(true)
    expect(trivialTask(1,3).equalOrHarder(trivialTask())).toBe(true)
})

test("task.queryString", () => {
    expect(trivialTask().queryString()).toBe("startBar=1&endBar=2&hand=Right&lessonURL=mockTask&mode=wait&methodology=none")
    expect(trivialTask(12345, 67890).queryString()).toBe("startBar=12345&endBar=67890&hand=Right&lessonURL=mockTask&mode=wait&methodology=none")
})

test("task.urlToTask", () => {
    let buildParams = (queryString: string) => {
        let params = new URLSearchParams(queryString)
        const result = {}
        for(const [key, value] of params) { // each 'entry' is a [key, value] tupple
            result[key] = value;
        }
        return result
    }

    expect(urlToTask(buildParams(trivialTask().queryString()))).toEqual(trivialTask())
    expect(urlToTask(buildParams(trivialTask(1, 78).queryString()))).toEqual(trivialTask(1, 78))
})

test("makeHand", () => {
    expect(makeHand("Right")).toBe(hand.Right)
    expect(makeHand("Left")).toBe(hand.Left)
    expect(makeHand("Both")).toBe(hand.Both)
})

test("handEqualOrHarder", () => {
    expect(handEqualOrHarder(hand.Left, hand.Left)).toBe(true)
    expect(handEqualOrHarder(hand.Right, hand.Right)).toBe(true)
    expect(handEqualOrHarder(hand.Both, hand.Both)).toBe(true)

    expect(handEqualOrHarder(hand.Right, hand.Left)).toBe(false)
    expect(handEqualOrHarder(hand.Left, hand.Right)).toBe(false)

    expect(handEqualOrHarder(hand.Left, hand.Both)).toBe(false)
    expect(handEqualOrHarder(hand.Both, hand.Left)).toBe(true)

    expect(handEqualOrHarder(hand.Right, hand.Both)).toBe(false)
    expect(handEqualOrHarder(hand.Both, hand.Right)).toBe(true)
})

test("referenceEquality", () => {
    expect(trivialTask()).toBe(trivialTask())
    expect(trivialTask(600, 876)).toBe(trivialTask(600, 876))

    let m = new Map([[trivialTask(), 5]])
    expect(m.get(trivialTask())).toBe(5)
})