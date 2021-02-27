import { objToURLArgs } from "../../util";
import { makeMode, modeEqualOrHarder, playbackMode } from "../mode/mode";

export class task {
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

    queryString() {
        return objToURLArgs(this)
    }

    equals(t: task):boolean {
        return this.lessonURL === t.lessonURL &&
            this.startBar === t.startBar &&
            this.hand === t.hand &&
            this.endBar === t.endBar &&
            this.mode.modeName() === t.mode.modeName()
    }

    // used to complete trivial progress that would be a waste of a completionist's time
    equalOrHarder(t: task):boolean {
        return this.lessonURL === t.lessonURL &&
            this.endBar >= t.endBar && 
            this.startBar <= t.startBar &&
            handEqualOrHarder(this.hand, t.hand) &&
            modeEqualOrHarder(this.mode, t.mode)
    }

    strictlyHarder(t: task) {
        return this.equalOrHarder(t) && !this.equals(t)
    }
}

export function urlToTask(query):task {
    return new task(parseInt(query.startBar), parseInt(query.endBar), makeHand(query.hand), query.lessonURL, makeMode(query.mode))
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