import { taskSpec } from "./lesson"
import type { lessonSet } from "./data";

export function replay(level: taskSpec):string {
    return "game?" + level.queryString()
}

export function nextLevel(level: taskSpec, ls: lessonSet):string {
    for (let i = 0; i < ls.lessons.length; i++) {
        const l = ls.lessons[i];
        if (l.name === level.lesson) {
            let result;
            l.sections.forEach(s => {
                s.hands.forEach(h => {
                    h.speeds.forEach((t) => {
                        if (t.progress < 100 && !result) {
                            let ts = new taskSpec(t.progress, s.startBar, s.endBar, h.hand, t.speed, level.lesson)
                            result = "game?" + ts.queryString()
                        }
                    })
                })
            });
            if (result) {
                return result
            }
            throw new Error("all complete, TODO: implement")
        }
    }
    throw new Error(`no lesson named ${level.lesson} found`)
}

export function levels(level: taskSpec):string {
    return "lesson?" + level.queryString()
}