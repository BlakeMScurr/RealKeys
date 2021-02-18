import { defaultLessons } from "./gameplay/curriculum/data"
import { deserializeArray } from 'class-transformer';
import { curriculum, progress, unlockCheckerFactory, UnlockCheckerType } from "./gameplay/curriculum/curriculum";
import type { task } from "./gameplay/curriculum/task";

const progressKey = "progress"
export function getProgress() {
    let c = defaultLessons()
    let p = localStorage.getItem(progressKey)
    if (p) {
        let prog: Array<progress> = deserializeArray(progress, p)
        prog.forEach((t) => {
            try {
                c.copyInScore(t.task, t.score)
            } catch (e) {
                console.warn(e)
            }
        })
    }
    return new curriculumWrapper(c)
}

class curriculumWrapper {
    private curriculum: curriculum;
    constructor(c: curriculum) {
        this.curriculum = c
    }

    recordScore(t: task, score: number) {
        this.curriculum.recordScore(t, score)

        // Save progress
        let ps: Array<progress>;
        this.curriculum.tasks.forEach((p: progress)=>{
            if (p.score > 0) {
                ps.push(p)
            }
        })
        localStorage.setItem(progressKey, JSON.stringify(ps))
    }

    unlocked(t: task):boolean {
        return this.curriculum.unlocked(t)
    }

    next():task {
        return this.curriculum.next()
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

}

// TODO: remove this garbo thing required to get around server side rendering
export function emptyProgress() {
    return new curriculumWrapper(new curriculum([], unlockCheckerFactory(UnlockCheckerType.Strict)))
}