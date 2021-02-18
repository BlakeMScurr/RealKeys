import type { task } from "./task"

// A curriculum is a set of a tasks, your progress through them, and way to determine whether you're ready for a given task
export class curriculum {
    tasks: Array<progress>; // Your progress through the tasks in the curriculum
    private checkUnlocked: unlockChecker;

    constructor(tasks: Array<task>, checkUnlocked: unlockChecker) {
        this.checkUnlocked = checkUnlocked
        this.tasks = new Array<progress>()
        tasks.forEach((t)=> {
            this.tasks.push(new progress(t))
        })
    }

    // Applies a certain amount of progress to a curriculum, and shows the all the tasks including those incomplete
    recordScore(t: task, score: number) {
        let i = indexOfTask(t, this.tasks)
        if (i < 0) {
            throw new Error(`Couldn't find task ${t} in curriculum ${this}`)
        }
        if (this.tasks[i].score < score) {
            this.tasks[i].score = score

            // complete tasks that are easier than this one, so the user doesn't have to redo their effort
            if (score >= 100) {
                this.tasks.forEach((incompleteTask)=>{
                    if (t.equalOrHarder(incompleteTask.task)) {
                        incompleteTask.score = 100
                    }
                })
            }
        }
    }

    copyInScore(t: task, score: number) {
        let i = indexOfTask(t, this.tasks)
        if (i < 0) {
            throw new Error(`Couldn't find task ${t} in curriculum ${this}`)
        }
        this.tasks[i].score = score
    }

    unlocked(t: task):boolean{
       return this.checkUnlocked(t, this.tasks)
    }

    // TODO: reduce from 0(n^2) complexity (n^3 for lenient procession) - memoising unlocked makes it O(n), and it may be memoised to 0(1) itself
    next():task {
        for (let i = 0; i < this.tasks.length; i++) {
            const t = this.tasks[i].task;

            if (this.unlocked(t) && this.tasks[i].score !== 100) {
                return t
            }
        }

        return null
    }

    getScore(t: task):number {
        return this.tasks[indexOfTask(t, this.tasks)].score
    }

    getLessons():Array<string> {
        let lessons = []
        this.tasks.forEach((p) => {
            if (lessons.indexOf(p.task.lessonURL) === -1) {
                lessons.push(p.task.lessonURL)
            }
        })
        return lessons
    }

    getLesson(lessonURL: string):Array<task> {
        let tasks = []
        this.tasks.forEach((p) => {
            if (p.task.lessonURL === lessonURL) {
                tasks.push(p.task)
            }
        })
        return tasks
    }
}

function indexOfTask(t: task, p: progress[]):number {
    // TODO: binary search
    for (let i = 0; i < p.length; i++) {
        if (t.equals(p[i].task)) {
            return i
        }
    }
    throw new Error(`Couldn't find task ${JSON.stringify(t)}`)
}

// progress gives your score on a given task
export class progress {
    constructor(t: task) {
        this.task = t
        this.score = 0
    }

    task: task;
    score: number;
}


// A unlockChecker determines whether you can try some task given your current progress
// TODO: make unlockChecker a far stricter type that is more like a relation on the graph of task dependencies. This will make it more declarative and less error prone.
type unlockChecker = (t: task, p: progress[]) => boolean

export enum UnlockCheckerType {
    Strict = 1,
    Lenient,
}

export function unlockCheckerFactory(typ: UnlockCheckerType):unlockChecker {
    switch (typ) {
        case UnlockCheckerType.Strict:
            return proceedStrictly
        case UnlockCheckerType.Lenient:
            return proceedLeniently
    }
}

// When proceeding strictly, we only move onto a task once all tasks that are easier than it are done
function proceedStrictly(t: task, p: progress[]):boolean {
    for (let i = 0; i < p.length; i++) {
        let comp = p[i]
        // a task is valid iff there is no other task that is strictly easier and is incomplete
        // thus we set valid to false if we find an easier incomplete task
        if (t.strictlyHarder(comp.task) && comp.score < 100) {
            return false
        }
    }
    return true
}

// When proceeding leniently, we move onto a task (C) if there is any easier task (A) where there is no middling task between them (B), or there is no easier task (A) at all.
function proceedLeniently(c: task, p: progress[]):boolean {
    // Proceed if there exists an A with no B between C and 
    for (let i = 0; i < p.length; i++) {
        let a = p[i].task
        let aScore = p[i].score
        if (c.strictlyHarder(a) && aScore >= 100) {
            let bBetween = false
            for (let j = 0; j < p.length; j++) {
                let b = p[j].task
                if (c.strictlyHarder(b) && b.strictlyHarder(a)) bBetween = true
            }
            
            if (!bBetween) return true
        }
    }

    // Proceed if there are no tasks easier than A
    for (let i = 0; i < p.length; i++) {
        if (c.strictlyHarder(p[i].task)) return false
    }
    return true
}