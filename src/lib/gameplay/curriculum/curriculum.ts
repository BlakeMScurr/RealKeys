import { hand, task } from "./task"

export interface Curriculum {
    recordScore(t: task, score: number)
    copyInScore(t: task, score: number)
    unlocked(t: task):boolean
    next(constraint?: (t:task) => boolean):task
    getScore(t: task):number
    getLessons():Array<string>
    getLesson(lessonURL: string):Array<task>
    getTasks():Array<progress>; // TODO: remove this as it should be an implementation detail
}

// A curriculum is a set of a tasks, your progress through them, and way to determine whether you're ready for a given task
export class curriculum {
    tasks: Array<progress>; // Your progress through the tasks in the curriculum
    private dependencies: Map<task, Array<task>>;

    constructor(tasks: Array<task>, dependencies: Map<task, Array<task>>) {
        this.dependencies = dependencies
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
        let deps = this.dependencies.get(t)
        if (!deps) return true
        for (let i = 0; i < deps.length; i++) {
            const dep: task = deps[i];
            if (this.getScore(dep) !== 100) {
                return false
            }
        }
        return true
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
            if (lessons.indexOf(p.task.getLessonURL()) === -1) {
                lessons.push(p.task.getLessonURL())
            }
        })
        return lessons
    }

    getLesson(lessonURL: string):Array<task> {
        let tasks = []
        this.tasks.forEach((p) => {
            if (p.task.getLessonURL() === lessonURL) {
                tasks.push(p.task)
            }
        })
        return tasks
    }

    getTasks():Array<progress> {
        return this.tasks
    }
}

export function StrictCurriculum(tasks: Array<task>):Curriculum {
    let deps = new Map<task, Array<task>>();

    tasks.forEach((t) => {
        deps.set(t, new Array<task>())
        tasks.forEach((dep) => {
            if (t.strictlyHarder(dep)) {
                deps.get(t).push(dep)
            }
        })
    })

    return new curriculum(tasks, deps)
}

function indexOfTask(t: task, p: progress[]):number {
    // TODO: binary search by just using maps, as tasks are now equal by reference
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

// functions that split up tasks to be viewed better

export function splitBySection(tasks: Array<task>) {
    return splitByX(tasks, (a: task,b: task):number=>{
        let sizeDifference = (a.getStartBar() - a.getEndBar()) - (b.getStartBar() - b.getEndBar())
        if (sizeDifference != 0) {
            return -sizeDifference // larger last
        }
        if (a.getStartBar() != b.getStartBar()) {
            return a.getStartBar() - b.getStartBar()
        }
        return a.getEndBar() - b.getEndBar()
    })
}

function handIndex(t: task) {
    switch (t.getHand()) {
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
        return a.getMode().getSpeed() - b.getMode().getSpeed()
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