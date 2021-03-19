import { modeFactory, modeName, playbackMode } from "../../mode/mode"
import { StrictCurriculum } from "../curriculum"
import type { Curriculum } from "../curriculum"
import { hand, NewTask, task } from "../task"
import { methodologyName } from "../methodology/methodology"

export function trivialTask(start: number=1, end: number=2, h: hand=hand.Right, mode: playbackMode=modeFactory(modeName.wait), methodology: methodologyName=methodologyName.none):task {
    return NewTask(start, end, h, "mockTask", mode, methodology)
}

export function twoPartCurriculum():Curriculum {
    return StrictCurriculum([
        trivialTask(),
        trivialTask(1,3),
    ])
}

// not to be confused with https://en.wikipedia.org/wiki/Trivium teeheehee ;)
export function trivialCurriculum():Curriculum {
    return StrictCurriculum([
        trivialTask(),
    ])
}