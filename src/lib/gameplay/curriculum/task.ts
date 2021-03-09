import { objToURLArgs } from "../../util";
import { makeMode, modeEqualOrHarder, playbackMode, equalModes } from "../mode/mode";

let existingTasks = new Map<string, internalTask>();
// NewTask ensures that all tasks having the same data also use the same reference so that they are well behaved in maps
export function NewTask(startBar: number, endBar: number, hand: hand, lessonURL: string, mode: playbackMode):task {
    let it = new internalTask(startBar, endBar, hand, lessonURL, mode)
    let str = JSON.stringify(it.serialisable())
    if (existingTasks.has(str)) {
        return existingTasks.get(str)
    }
    existingTasks.set(str, it)
    return it
}
export interface task {
    getMode():playbackMode
    getHand():hand
    getStartBar():number
    getEndBar():number
    getLessonURL():string

    queryString():string
    equals(t: task):boolean
    equalOrHarder(t: task):boolean
    strictlyHarder(t: task):boolean
    serialisable():object
}

class internalTask {
    lessonURL: string;
    startBar: number;
    endBar: number;
    hand: hand;
    mode: playbackMode;

    constructor(startBar: number, endBar: number, hand: hand, lessonURL: string, mode: playbackMode) {
        this.startBar = startBar
        this.endBar = endBar
        this.hand = hand
        this.lessonURL = lessonURL
        this.mode = mode
    }

    queryString():string {
        return objToURLArgs(this.serialisable())
    }

    equals(t: task):boolean {
        let it = <internalTask>t
        return this.lessonURL === it.lessonURL &&
            this.startBar === it.startBar &&
            this.hand === it.hand &&
            this.endBar === it.endBar &&
            equalModes(this.mode, it.mode)
    }

    // used to complete trivial progress that would be a waste of a completionist's time
    equalOrHarder(t: task):boolean {
        let it = <internalTask>t
        return this.lessonURL === it.lessonURL &&
            this.endBar >= it.endBar && 
            this.startBar <= it.startBar &&
            handEqualOrHarder(this.hand, it.hand) &&
            modeEqualOrHarder(this.mode, it.mode)
    }

    strictlyHarder(t: task):boolean {
        let it = <internalTask>t
        return this.equalOrHarder(it) && !this.equals(it)
    }

    serialisable():object {
        let mode = this.mode.toString()
        let t: any = JSON.parse(JSON.stringify(this))
        t.mode = mode
        return t
    }

    getMode():playbackMode {
        return this.mode
    }

    getHand():hand {
        return this.hand
    }

    getStartBar():number {
        return this.startBar
    }

    getEndBar():number {
        return this.endBar
    }

    getLessonURL():string {
        return this.lessonURL
    }
}

export function urlToTask(query):task {
    return NewTask(parseInt(query.startBar), parseInt(query.endBar), makeHand(query.hand), query.lessonURL, makeMode(query.mode))
}

export function makeHand(h: string):hand {
    switch (h) {
        case hand.Left:
            return hand.Left
        case hand.Right:
            return hand.Right
        case hand.Both:
            return hand.Both
    }
    throw new Error(`unknown hand ${h}`)
}

export enum hand {
    Left = "Left",
    Right = "Right",
    Both = "Both",
}

export function describeHand(h: hand) {
    switch (h) {
        case hand.Left:
            return "Left hand"
        case hand.Right:
            return "Right hand"
        case hand.Both:
            return "Both hands"
    }
}

// TODO: can I overload the >= operator to call this function?
export function handEqualOrHarder(a: hand, b: hand):boolean {
    return a === b || a === hand.Both
}