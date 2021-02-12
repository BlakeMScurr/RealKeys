import { OneTo100 } from "../util";
import 'reflect-metadata';

export enum difficulty {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
}

export class taskSpec {
    // TODO: remove score, as it doesn't actually specify the task
    score: number;
    startBar: number;
    endBar: number;
    hand: hand;
    speed: speed;
    lesson: string;
    constructor (score: number, startBar: number, endBar: number, hand: hand, speed: speed, lesson: string) {
        this.score = score
        this.startBar = startBar
        this.endBar = endBar
        this.hand = hand
        this.speed = speed
        this.lesson = lesson
    }

    queryString() {
        return Object.entries(this).map((a)=>{return a[0] + "=" + a[1]}).join("&")
    }
}

export class lesson {
    level: difficulty;
    name: string;
    sections: Array<section>;
    constructor(level: difficulty, name: string, barDelineators: Array<Array<number>>) {
        this.level = level
        this.name = name
        this.sections = []
        try {
            for (let i = 0; i < barDelineators.length; i++) {
                // Ensure that each layer of delineators
                // - covers the same area
                // - uses a subset of the last delineators
                // - contains fewer than the last delineators
                if (barDelineators[i][0] !== barDelineators[0][0] || barDelineators[i][barDelineators[i].length-1] !==  barDelineators[0][barDelineators[0].length-1]){
                    throw new Error("Inconsistent outerbars")
                }

                barDelineators[i].forEach((delineator, j) => {
                    if (barDelineators[0].indexOf(delineator) === -1) {
                        throw new Error("New delineators")
                    }

                    if (i !== 0 && j !== 0) {
                        let prev = barDelineators[i][j-1]
                        let curr = barDelineators[i][j]
                        let prevInLast = barDelineators[i-1][barDelineators[i-1].indexOf(curr) - 1]
                        if (prev === prevInLast) {
                            throw new Error("Old adjacencies")
                        }
                    }
                })

                this.sections.push(...sections(barDelineators[i], i !== 0))
            }
        } catch(e) {} // this is to allow plainToClass to call the constructor without erroring
    }

    recordScore(task: taskSpec) {
        let foundSection = false
        for (let i = 0; i < this.sections.length; i++) {
            const sec = this.sections[i];
            if (sec.startBar === task.startBar && sec.endBar === task.endBar) {
                sec.recordScore(task)
                foundSection = true
                break
            }
        }

        if (!foundSection) {
            throw new Error(`Couldn't find section from bar ${task.startBar} to ${task.endBar}, have sections ${this.sections}`)
        }

        // unlock if dependencies are done
        // TODO: don't check every single section every single time
        this.sections.forEach((section , i) => {
            // find dependencies
            let deps: Array<section> = []
            this.sections.forEach((possibleDep, j) => {
                if (possibleDep.startBar >= section.startBar && possibleDep.endBar <= section.endBar && i !== j) {
                    deps.push(possibleDep)
                }
            })

            // if all dependencies are done and ths section is locked, unlock the section entirely
            if (section.hands[0].speeds[0].state === state.locked && deps.reduce((acc, curr) => { return acc && curr.done() }, true)) {
                section.hands.forEach((h) => {
                    h.speeds.forEach((s) => {
                        if (s.speed === speed.OwnPace) {
                            s.state = state.reccomended
                        } else {
                            s.state = state.allowed
                        }
                    })
                })
            }
        })
    }
}

function sections(dividers: Array<number>, higherLevel: boolean): Array<section> {
    if (dividers[0] !== 1) throw new Error("First bar of first section must be bar 1")
    let sections: Array<section> = []
    for (let i = 1; i < dividers.length; i++) {
        sections.push(new section(dividers[i-1], dividers[i], higherLevel))
    }
    return sections
}

export class section { // TODO: unexport asap
    hands: Array<handSection>;
    startBar: number;
    endBar: number;
    constructor(startBar: number, endBar: number, higherLevel: boolean) {
        try {

            if (Math.floor(endBar) !== endBar || Math.floor(startBar) !== startBar) throw new Error("Bars must be integers")
            if (startBar >= endBar) throw new Error("The end of a section must be after the start")
            if (startBar <= 0 || endBar <= 0) throw new Error("Bar numbers can't be 0 or negative")
            
            this.hands = allHandSections(higherLevel)
            this.startBar = startBar
            this.endBar = endBar
        } catch(e){} // todo: get rid of, once plainToClass works properly for nested things
    }

    recordScore(task: taskSpec) {
        let foundHand = false
        for (let i = 0; i < this.hands.length; i++) {
            const h = this.hands[i];
            if (h.hand === task.hand) {
                h.recordScore(task)
                foundHand = true
                break
            }
        }
        if (!foundHand) {
            throw new Error(`Couldn't find section for hand ${task.hand}`)
        }

        if (this.hands[0].allDone() && this.hands[1].allDone() && this.hands[2].speeds[0].state === state.locked) {
            this.hands[2].speeds[0].state = state.reccomended
        }
    }

    done() {
        return this.hands[2].speeds[2].progress === 100
    }
}

function allHandSections(higherLevel: boolean):Array<handSection> {
    return [
        new handSection(allSpeeds(higherLevel), hand.Right),
        new handSection(allSpeeds(higherLevel), hand.Left),
        new handSection(allSpeeds(true), hand.Both),
    ]
}

export class handSection {
    speeds: Array<task>;
    hand: hand;
    constructor(speeds: Array<task>, hand: hand) {
        this.speeds = speeds
        this.hand = hand
    }

    recordScore(task: taskSpec) {
        for (let i = 0; i < this.speeds.length; i++) {
            const s = this.speeds[i];
            if (s.speed === task.speed) {
                if (s.state === state.locked) {
                    throw new Error("Can't attempt locked lesson")
                }

                if (task.score > s.progress) s.progress = task.score
                if (task.score === 100) {
                    s.state = state.allowed
                    if (i + 1 < this.speeds.length) {
                        this.speeds[i + 1].state = state.reccomended
                    }
                }
                return
            }
        }
        throw new Error(`Couldn't find section for speed ${speed}`)
    }

    allDone() {
        return this.speeds.reduce((acc, curr) => { return acc && curr.progress === 100}, true)
    }
}

export enum hand {
    Left = "Left",
    Right = "Right",
    Both = "Both",
}

// TODO: is there a more concise way to force the type?
export function makeHand(name: string) {
    switch (name) {
        case "Left":
        case "left":
            return hand.Left
        case "Right":
        case "right":
            return hand.Right
        case "Both":
        case "both":
            return hand.Both
        default:
            throw new Error(`invalid hand ${name}`)
    }
}

export function handDesc(h: hand) {
    switch(h) {
        case hand.Left:
            return "the left hand"
        case hand.Right:
            return "the right hand"
        case hand.Both:
            return "both hands"
    }
}

function allSpeeds(locked: boolean):Array<task> {
    return [
        new task(speed.OwnPace, 0, locked ? state.locked : state.reccomended),
        // new task(speed.Fifty, 0, state.locked), // TODO: find out if others agree that this is too slow, I find it way too easy, but I suppose I'm not my target market!
        new task(speed.SeventyFive, 0, state.locked),
        new task(speed.OneHundred, 0, state.locked),
    ]
}

export class task {
    speed: speed;
    progress: number;
    state: state;
    
    constructor(speed: speed, progress: number, state: state) {
        this.speed = speed
        this.progress = OneTo100(progress)
        this.state = state
    }
}

export enum state {
    locked = "locked",
    allowed = "allowed", 
    reccomended = "reccomended",
}

export enum speed {
    OwnPace = "own",
    Fifty = "50",
    SeventyFive = "75",
    OneHundred = "100",
}

export function longNameSpeed(s: speed):string {
    switch(s) {
        case speed.OwnPace:
            return "At your own pace"
        case speed.Fifty:
            return "50% speed"
            case speed.SeventyFive:
            return "75% speed"
            case speed.OneHundred:
            return "100% speed"
    }
}

export function makeSpeed(speedString: string) {
    switch (speedString) {
        case "own":
            return speed.OwnPace
        case  "50":
            return speed.Fifty
        case  "75":
            return speed.SeventyFive
        case  "100":
            return speed.OneHundred
        default:
            throw new Error(`invalid speed ${speedString}`)
    }
}

export function urlToTask(query) {
    return new taskSpec(parseInt(query.score), parseInt(query.startBar), parseInt(query.endBar), makeHand(query.hand), makeSpeed(query.speed), query.lesson)
}