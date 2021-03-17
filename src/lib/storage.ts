import { defaultLessons } from "./gameplay/curriculum/data"
import { Curriculum, curriculum } from "./gameplay/curriculum/curriculum";
import { NewTask, task } from "./gameplay/curriculum/task";
import { makeMode } from "./gameplay/mode/mode";
import { makeMethodology, methodologyName } from "./gameplay/curriculum/methodology/methodology";

const settingsKey = "settings"
export function getSettings() {
    return localStorage.getItem(settingsKey)
}

export function setSettings(t: inputType) {
    localStorage.setItem(settingsKey, t)
}


export enum inputType {
    midi = "MIDI Keyboard",
    qwerty = "QWERTY Keyboard",
    touch = "Touch Screen",
}

const progressKey = "progress"
export function getProgress(c: Curriculum):Curriculum {
    restoreProgress().forEach((t) => {
        try {
            c.copyInScore(t[0], t[1])
        } catch (e) {
            // console.warn("Failed to copy in score for task" + JSON.stringify(t) + e)
        }
    })
    return new curriculumWrapper(c)
}

function restoreProgress():Array<[task, number]> {
    let tasks: Array<[task, number]> = []
    let p = localStorage.getItem(progressKey)
    if (p) {
        let prog = JSON.parse(p)
        prog.forEach((t: any) => {
            let nt: [task, number] = [NewTask(t.task.startBar, t.task.endBar, t.task.hand, t.task.lessonURL, makeMode(t.task.mode), makeMethodology(t.task.methodology)), <number>t.score]
            tasks.push(nt)
        })
    }
    return tasks
}

class curriculumWrapper {
    private curriculum: Curriculum;
    constructor(c: Curriculum) {
        this.curriculum = c
    }

    recordScore(t: task, score: number) {
        this.curriculum.recordScore(t, score)

        let serialisable = []
        this.curriculum.getTasks().forEach((score: number, t: task)=> {
            if (score > 0) {
                serialisable.push({
                    task: t.serialisable(),
                    score: score,
                })
            }
        })

        // save in the old state too
        // TODO: do this in place, somehow
        restoreProgress().forEach((t) => {
            if (t[1] > 0) {
                serialisable.push({
                    task: t[0].serialisable(),
                    score: t[1],
                })
            }
        })

        localStorage.setItem(progressKey, JSON.stringify(serialisable))
    }

    unlocked(t: task):boolean {
        return this.curriculum.unlocked(t)
    }

    next(constraint: (t:task) => boolean):task {
        return this.curriculum.next(constraint)
    }

    getScore(t: task):number {
        return this.curriculum.getScore(t)
    }

    getLessons():Array<string> {
        return this.curriculum.getLessons()
    }

    getLesson(lessonURL: string):Array<task> {
        return this.curriculum.getLesson(lessonURL)
    }

    getTasks():Map<task, number> {
        return this.curriculum.getTasks()
    }

    copyInScore(t: task, score: number) {
        this.curriculum.copyInScore(t, score)
    }

    maximalTasks():Array<task> {
        return this.curriculum.maximalTasks()
    }

    minimalTasks():Array<task> {
        return this.curriculum.minimalTasks()
    }

    getDependencies():Map<task, Array<task>> {
        return this.curriculum.getDependencies()
    }
}

// TODO: remove this garbo thing required to get around server side rendering
export function emptyProgress() {
    return new curriculumWrapper(new curriculum([], new Map()))
}