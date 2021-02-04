import type { Note } from "../music/theory/notes";
import { get } from "../util";
import type { Readable } from "svelte/types/runtime/store"

export enum state {
    valid = "valid",
    invalid = "invalid",
    indifferent = "indifferent",
}


export interface scorer {
    validRatio():number
}
export class timedScoreKeeper {
    private position: Readable<number>;
    private validSum: number;
    private invalidSum: number;
    private lastNotePositions: Map<string, number>;
    private lastNoteStates: Map<string, state>;
    private subscribers;

    constructor(position: Readable<number>) {
        this.validSum = 0
        this.invalidSum = 0
        this.lastNotePositions = new Map<string, number>();
        this.lastNoteStates = new Map<string, state>();
        this.subscribers = []
        
        position.subscribe((pos) => {
            this.triggerScoreUpdate(pos)
        })
        this.position = position
    }

    validRatio():number {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total
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
}

export class untimedScoreKeeper {
    private validSum: number;
    private invalidSum: number;
    private subscribers;
    private lastNoteStates: Map<string, state>;

    constructor() {
        this.validSum = 0
        this.invalidSum = 0
        this.subscribers = []
        this.lastNoteStates = new Map();
    }

    validRatio():number {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total
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

        if (s === state.valid) {
            this.validSum++
        } else if (s === state.invalid) {
            this.invalidSum++
        }

        this.triggerScoreUpdate(0)
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
