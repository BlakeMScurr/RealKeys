import { defaultLessons } from "./gameplay/curriculum/data"
import { deserializeArray, plainToClass } from 'class-transformer';
import { Curriculum, curriculum, progress, unlockCheckerFactory, UnlockCheckerType } from "./gameplay/curriculum/curriculum";
import { task } from "./gameplay/curriculum/task";
import { makeMode } from "./gameplay/mode/mode";

const progressKey = "progress"
export function getProgress():Curriculum {
    let c = defaultLessons()
    let p = localStorage.getItem(progressKey)
    if (p) {
        let prog = JSON.parse(p)
        prog.forEach((t) => {
            try {
                let tsk = new task(t.task.startBar, t.task.endBar, t.task.hand, t.task.lessonURL, makeMode(t.task.mode.modeID))
                c.copyInScore(tsk, t.score)
            } catch (e) {
                console.warn("Failed to copy in score for task" + JSON.stringify(t) + e)
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
        let ps: Array<progress> = [];
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

}

// TODO: remove this garbo thing required to get around server side rendering
export function emptyProgress() {
    return new curriculumWrapper(new curriculum([], unlockCheckerFactory(UnlockCheckerType.Strict)))
}