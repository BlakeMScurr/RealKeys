import { defaultLessons } from "./gameplay/curriculum/data"
import { Curriculum, curriculum } from "./gameplay/curriculum/curriculum";
import { NewTask, task } from "./gameplay/curriculum/task";
import { makeMode } from "./gameplay/mode/mode";

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
export function getProgress():Curriculum {
    let c = defaultLessons()
    let p = localStorage.getItem(progressKey)
    if (p) {
        let prog = JSON.parse(p)
        prog.forEach((t: any) => {
            try {
                let tsk = NewTask(t.task.startBar, t.task.endBar, t.task.hand, t.task.lessonURL, makeMode(t.task.mode))
                c.copyInScore(tsk, t.score)
            } catch (e) {
                console.warn("Failed to copy in score for task" + JSON.stringify(t) + e)
            }
        })
    }
    return new curriculumWrapper(c)
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
            serialisable.push({
                task: t.serialisable(),
                score: score,
            })
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