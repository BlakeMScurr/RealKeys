import { hand, task } from "./task"

export interface Curriculum {
    recordScore(t: task, score: number)
    unlocked(t: task):boolean
    next(constraint?: (t:task) => boolean):task
    getScore(t: task):number
    getLessons():Array<string>
    getLesson(lessonURL: string):Array<task>
}

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

    // TODO: reduce from 0(n^2) complexity - memoising unlocked makes it O(n), and it may be memoised to 0(1) itself
    next(constraint: (t:task) => boolean = ()=>{return true}):task {
        for (let i = 0; i < this.tasks.length; i++) {
            const t = this.tasks[i].task;

            if (this.tasks[i].score !== 100 && constraint(t) && this.unlocked(t) ) {
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
}

export function unlockCheckerFactory(typ: UnlockCheckerType):unlockChecker {
    switch (typ) {
        case UnlockCheckerType.Strict:
            return proceedStrictly
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


// functions that split up tasks to be viewed better

export function splitBySection(tasks: Array<task>) {
    return splitByX(tasks, (a: task,b: task):number=>{
        let sizeDifference = (a.startBar - a.endBar) - (b.startBar - b.endBar)
        if (sizeDifference != 0) {
            return -sizeDifference // larger last
        }
        if (a.startBar != b.startBar) {
            return a.startBar - b.startBar
        }
        return a.endBar - b.endBar
    })
}

function handIndex(t: task) {
    switch (t.hand) {
        case hand.Right:
            return 0
        case hand.Left:
            return 1
        case hand.Both:
            return 2
    }
}
export function splitByHand(tasks: Array<task>) {
    return splitByX(tasks, (a: task,b: task):number=>{
        return handIndex(a) - handIndex(b)
    })
}

export function splitByMode(tasks: Array<task>) {
    return splitByX(tasks, (a: task,b: task):number=>{
        return a.mode.getSpeed() - b.mode.getSpeed()
    })
}

function splitByX(tasks: Array<task>, compare: (a: task, b: task)=>number):Array<Array<task>> {
    if (tasks.length === 0) return []
    tasks.sort(compare)

    let arr = new Array<Array<task>>([tasks[0]])
    for (let i = 1; i < tasks.length; i++) {
        if (compare(tasks[i], tasks[i-1]) === 0) {
            arr[arr.length-1].push(tasks[i])
        } else {
            arr.push([tasks[i]])
        }
    }

    return arr
}