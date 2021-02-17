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

    unlocked(t: task):boolean{
       return this.checkUnlocked(t, this.tasks)
    }

    // TODO: reduce from 0(n^2) complexity - may even be memoisable to O(1)
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
}

function indexOfTask(t: task, p: progress[]):number {
    // TODO: binary search
    for (let i = 0; i < p.length; i++) {
        if (t.equals(p[i].task)) {
            return i
        }
    }
    return -1
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
type unlockChecker = (t: task, p: progress[]) => boolean

// unlockChecker functions
// When we use the proceed strictly function, we only move onto a task once all tasks that are easier than it are done
export function proceedStrictly(t: task, p: progress[]):boolean {
    let valid = true
    for (let i = 0; i < p.length; i++) {
        let comp = p[i]
        // a task is valid iff there is no other task that is strictly easier and is incomplete
        // thus we set valid to false if we find an easier incomplete task
        if (t.equalOrHarder(comp.task) && !t.equals(comp.task) && comp.score < 100) {
            valid = false
        }
    }
    return valid
}