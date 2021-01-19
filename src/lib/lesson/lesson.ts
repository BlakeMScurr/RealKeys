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
    constructor(level: difficulty, name: string, sections: Array<section>) {
        this.level = level
        this.name = name
        this.sections = sections
    }

    recordScore(score: number, startBar: number, endBar: number, hand: hand, speed: speed) {
        // TODO: implement
    }
}

export function sections(dividers: Array<number>): Array<section> {
    if (dividers[0] !== 1) throw new Error("First bar of first section must be bar 1")
    let sections: Array<section> = []
    for (let i = 1; i < dividers.length; i++) {
        sections.push(new section(dividers[i-1], dividers[i]))
    }
    return sections
}

class section {
    hands: Array<handSection>;
    startBar: number;
    endBar: number;
    constructor(startBar: number, endBar: number) {
        if (Math.floor(endBar) !== endBar || Math.floor(startBar) !== startBar) throw new Error("Bars must be integers")
        if (startBar >= endBar) throw new Error("The end of a section must be after the start")
        if (startBar <= 0 || endBar <= 0) throw new Error("Bar numbers can't be 0 or negative")

        this.hands = allHandSections()
        this.startBar = startBar
        this.endBar = endBar
    }
}

function allHandSections():Array<handSection> {
    return [
        new handSection(allSpeeds(), hand.Right),
        new handSection(allSpeeds(), hand.Left),
        new handSection(allSpeeds(), hand.Both),
    ]
}

export class handSection {
    speeds: Array<task>;
    hand: hand;
    constructor(speeds: Array<task>, hand: hand) {
        this.speeds = speeds
        this.hand = hand
    }
}

export enum hand {
    Left = "Left",
    Right = "Right",
    Both = "Both",
}

function allSpeeds():Array<task> {
    return [
        new task(speed.OwnPace, 0),
        new task(speed.Fifty, 0),
        new task(speed.SeventyFive, 0),
        new task(speed.OneHundred, 0),
    ]
}

export class task {
    speed: speed;
    progress: number;
    constructor(speed: speed, progress: number) {
        this.speed = speed
        this.progress = OneTo100(progress)
    }
}

export enum speed {
    OwnPace = "At your own pace",
    Fifty = "50% speed",
    SeventyFive = "75% speed",
    OneHundred = "100% speed",
}