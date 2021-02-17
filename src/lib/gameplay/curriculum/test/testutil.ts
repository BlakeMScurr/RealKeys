import { modeFactory, modeName } from "../../mode/mode"
import { curriculum, proceedStrictly } from "../curriculum"
import { hand, task } from "../task"

export function trivialTask(start: number=1, end: number=2):task {
    return new task(start, end, hand.Right, "mockTask", modeFactory(modeName.wait))
}

export function twoPartCurriculum():curriculum {
    return new curriculum([
        trivialTask(),
        trivialTask(1,3),
    ], proceedStrictly)
}

// not to be confused with https://en.wikipedia.org/wiki/Trivium teeheehee ;)
export function trivialCurriculum():curriculum {
    return new curriculum([
        trivialTask(),
    ], (t: task):boolean=> { return true })
}