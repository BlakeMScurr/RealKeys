import { start } from "tone";
import { OneTo100 } from "../util";

export enum difficulty {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
}

export class lesson {
    level: difficulty;
    name: string;
    sections: Array<section>;
    constructor(level: difficulty, name: string, barDelineators: Array<Array<number>>) {
        this.level = level
        this.name = name
        this.sections = []
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
    }

    recordScore(score: number, startBar: number, endBar: number, hand: hand, s: speed) {
        let foundSection = false
        for (let i = 0; i < this.sections.length; i++) {
            const sec = this.sections[i];
            if (sec.startBar === startBar && sec.endBar === endBar) {
                sec.recordScore(score, hand, s)
                foundSection = true
                break
            }
        }

        if (!foundSection) {
            throw new Error(`Couldn't find section from bar ${start} to ${endBar}`)
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

class section {
    hands: Array<handSection>;
    startBar: number;
    endBar: number;
    constructor(startBar: number, endBar: number, higherLevel: boolean) {
        if (Math.floor(endBar) !== endBar || Math.floor(startBar) !== startBar) throw new Error("Bars must be integers")
        if (startBar >= endBar) throw new Error("The end of a section must be after the start")
        if (startBar <= 0 || endBar <= 0) throw new Error("Bar numbers can't be 0 or negative")

        this.hands = allHandSections(higherLevel)
        this.startBar = startBar
        this.endBar = endBar
    }

    recordScore(score: number, hand: hand, speed: speed) {
        let foundHand = false
        for (let i = 0; i < this.hands.length; i++) {
            const h = this.hands[i];
            if (h.hand === hand) {
                h.recordScore(score, speed)
                foundHand = true
                break
            }
        }
        if (!foundHand) {
            throw new Error(`Couldn't find section for hand ${hand}`)
        }

        if (this.hands[0].allDone() && this.hands[1].allDone() && this.hands[2].speeds[0].state === state.locked) {
            this.hands[2].speeds[0].state = state.reccomended
        }
    }

    done() {
        return this.hands[2].speeds[3].progress === 100
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

    recordScore(score: number, speed: speed) {
        for (let i = 0; i < this.speeds.length; i++) {
            const s = this.speeds[i];
            if (s.speed === speed) {
                if (s.state === state.locked) {
                    throw new Error("Can't attempt locked lesson")
                }

                if (score > s.progress) s.progress = score
                if (score === 100) {
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

function allSpeeds(locked: boolean):Array<task> {
    return [
        new task(speed.OwnPace, 0, locked ? state.locked : state.reccomended),
        new task(speed.Fifty, 0, state.locked),
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
    OwnPace = "At your own pace",
    Fifty = "50% speed",
    SeventyFive = "75% speed",
    OneHundred = "100% speed",
}