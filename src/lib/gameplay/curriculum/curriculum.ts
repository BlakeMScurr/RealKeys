import { hand, task } from "./task"

export interface Curriculum {
    recordScore(t: task, score: number)
    copyInScore(t: task, score: number)
    unlocked(t: task):boolean
    next(constraint?: (t:task) => boolean):task
    getScore(t: task):number
    getLessons():Array<string>
    getLesson(lessonURL: string):Array<task>
    getTasks():Map<task, number>
}

// A curriculum is a set of a tasks, your progress through them, and way to determine whether you're ready for a given task
export class curriculum {
    // TODO: replace with a
    tasks:  Map<task, number>;
    private dependencies: Map<task, Array<task>>;

    constructor(tasks: Array<task>, dependencies: Map<task, Array<task>>) {
        this.dependencies = dependencies
        this.tasks = new Map<task, number>()
        tasks.forEach((t)=> {
            this.tasks.set(t, 0)
        })
    }

    // Applies a certain amount of progress to a curriculum, and shows the all the tasks including those incomplete
    recordScore(t: task, score: number) {
        if (!this.tasks.has(t)) {
            throw new Error(`Couldn't find task ${t} in curriculum ${this}`)
        }
        if (this.tasks.get(t) < score) {
            this.tasks.set(t, score)

            // complete tasks that are easier than this one, so the user doesn't have to redo their effort
            if (score >= 100) {
               this.backwardsCompletion(t)
            }
        }
    }

    // complete all this task's deps and all its deps' deps etc
    // TODO: prevent infinite recursion on cycles
    private backwardsCompletion(t: task) {
        let deps = this.dependencies.get(t)
            if (deps) {
                deps.forEach((dep) => {
                this.tasks.set(dep, 100)
                this.backwardsCompletion(dep)
            })
        }
    }

    copyInScore(t: task, score: number) {
        if (!this.tasks.has(t)) {
            throw new Error(`Couldn't find task ${t} in curriculum ${this}`)
        }
        this.tasks.set(t, score)
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

    // TODO: reduce complexity from O(nd), where d is the average number of dependencies per task. Not high priority.
    next(constraint: (t:task) => boolean = ()=>{return true}):task {
        for (const ts of this.tasks) {
            if (ts[1] !== 100 && constraint(ts[0]) && this.unlocked(ts[0]) ) {
                return ts[0]
            }
        }

        return null
    }

    getScore(t: task):number {
        return this.tasks.get(t)
    }

    getLessons():Array<string> {
        let lessons = []
        this.tasks.forEach((_, t) => {
            if (lessons.indexOf(t.getLessonURL()) === -1) {
                lessons.push(t.getLessonURL())
            }
        })
        return lessons
    }

    getLesson(lessonURL: string):Array<task> {
        let tasks = []
        this.tasks.forEach((_, t) => {
            if (t.getLessonURL() === lessonURL) {
                tasks.push(t)
            }
        })
        return tasks
    }

    getTasks():Map<task, number> {
        return this.tasks
    }
}

// TODO: should this function live at the methodology level?
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