import type { Readable } from "svelte/types/runtime/store";
import type { Note } from "../music/theory/notes";
import { get } from "../util";

export enum state {
    valid = "valid",
    invalid = "invalid",
    indifferent = "indifferent",
}


export interface scorer {
    validRatio():number
    inputChange()
    recordNoteState(note: Note, s: state, position: number)
}

const defaultLeniency = 0.85
export class timedScoreKeeper {
    private position: Readable<number>;
    private validSum: number;
    private invalidSum: number;
    private lastNotePositions: Map<string, number>;
    private lastNoteStates: Map<string, state>;
    private leniency: number;
    private subscribers;

    constructor(position: Readable<number>, leniency?: number) {
        this.validSum = 0
        this.invalidSum = 0
        this.lastNotePositions = new Map<string, number>();
        this.lastNoteStates = new Map<string, state>();
        this.subscribers = []
        this.leniency = leniency !== undefined ? leniency : defaultLeniency
        
        position.subscribe((pos) => {
            this.triggerScoreUpdate(pos)
        })
        this.position = position
    }

    validRatio():number {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total / this.leniency
        } else if (total < 0) {
            throw new Error("Can't have negative time")
        }
        return 1 // we consider an attempt to be totally valid until proven otherwise
    }

    recordNoteState(note: Note, s: state, position: number) {
        let ns = note.string()
        let first = !this.lastNoteStates.has(ns) && !this.lastNotePositions.has(ns)

        if (!first) {
            if (this.lastNoteStates.get(ns) == s) {
                return
            }

            if (position <= this.lastNotePositions.get(ns)) {
                throw new Error(`State already recorded for note ${ns} at position ${position}`)
            }

            let prevS = this.lastNoteStates.get(ns)
            if (prevS === state.valid) {
                this.validSum += position - this.lastNotePositions.get(ns)
            } else if (prevS === state.invalid) {
                this.invalidSum += position - this.lastNotePositions.get(ns)
            }
        }

        this.lastNotePositions.set(ns, position)
        this.lastNoteStates.set(ns, s)

        this.triggerScoreUpdate(get(this.position))
    }

    triggerScoreUpdate(pos: number) {
        const score = this.validRatio() * pos
        this.subscribers.forEach(f => {
            f(score)
        }); 
    }

    subscribe(f) {
        this.subscribers.push(f)
        this.triggerScoreUpdate(get(this.position))
    }

    validTime () {
        return this.validSum
    }

    invalidTime () {
        return this.invalidSum
    }

    // fulfills the interface for untimed scorer
    inputChange(){}
}

// TODO: test
export class untimedScoreKeeper {
    private validSum: number;
    private invalidSum: number;
    private subscribers;
    private lastNoteStates: Map<string, state>;
    private leniency: number;
    private inputHasChanged: boolean;

    constructor(leniency?: number) {
        this.validSum = 0
        this.invalidSum = 0
        this.subscribers = []
        this.lastNoteStates = new Map();
        this.leniency = leniency !== undefined ? leniency : defaultLeniency
        this.inputHasChanged = true
    }

    validRatio():number {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total / this.leniency
        } else if (total < 0) {
            throw new Error("Can't have negative time")
        }
        return 1 // we consider an attempt to be totally valid until proven otherwise
    }

    recordNoteState(note: Note, s: state, position: number) {
        if (this.lastNoteStates.has(note.string()) && this.lastNoteStates.get(note.string()) === s) {
            return
        }
        this.lastNoteStates.set(note.string(), s)

        if (this.inputHasChanged) {
            if (s === state.valid) {
                this.validSum++
            } else if (s === state.invalid) {
                this.invalidSum++
            }
            this.inputHasChanged = false
        }

        this.triggerScoreUpdate(0)
    }

    // In wait mode, you shoudln't get a note wrong for holding it after the note is expected to end.
    // So we only record a score for a given note if the input has changed for that note since last time we called score.
    // TODO: test (for that matter, test this whole class at least a bit)
    inputChange() {
        this.inputHasChanged = true
    }

    triggerScoreUpdate(pos: number) {
        const score = this.validRatio()
        this.subscribers.forEach(f => {
            f(score)
        }); 
    }

    subscribe(f) {
        this.subscribers.push(f)
        this.triggerScoreUpdate(0)
    }

    validTime () {
        return this.validSum
    }

    invalidTime () {
        return this.invalidSum
    }
}
