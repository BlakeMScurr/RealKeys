import { modeFactory, modeName, playbackMode } from "../../mode/mode"
import { curriculum, unlockCheckerFactory, UnlockCheckerType } from "../curriculum"
import { hand, task } from "../task"

export function trivialTask(start: number=1, end: number=2, h: hand=hand.Right, mode: playbackMode=modeFactory(modeName.wait)):task {
    return new task(start, end, h, "mockTask", mode)
}

export function twoPartCurriculum():curriculum {
    return new curriculum([
        trivialTask(),
        trivialTask(1,3),
    ], unlockCheckerFactory(UnlockCheckerType.Strict))
}

// not to be confused with https://en.wikipedia.org/wiki/Trivium teeheehee ;)
export function trivialCurriculum():curriculum {
    return new curriculum([
        trivialTask(),
    ], (t: task):boolean=> { return true })
}