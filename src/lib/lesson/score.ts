import type { Note } from "../music/theory/notes";

export enum state {
    valid = "valid",
    invalid = "invalid",
    indifferent = "indifferent",
}

export class timedScoreKeeper {
    private lastPosition: number;
    private validSum: number;
    private invalidSum: number;
    private lastNotePositions: Map<string, number>;
    private lastNoteStates: Map<string, state>;

    constructor() {
        this.lastPosition = 0
        this.validSum = 0
        this.invalidSum = 0
        this.lastNotePositions = new Map<string, number>();
        this.lastNoteStates = new Map<string, state>();
    }

    validRatio () {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total
        } else if (total < 0) {
            throw new Error("Can't have negative time")
        }
        return 1 // we consider an attempt to be totally valid until proven otherwise
    }

    score () {
        return this.validRatio() * this.lastPosition
    }

    recordNoteState(note: Note, s: state, position: number) {
        if (position < this.lastPosition) {
            throw new Error("Can't record note state out of order")
        }

        let ns = note.string()
        let first = !this.lastNoteStates.has(ns) && !this.lastNotePositions.has(ns)
        
        if (!first) {
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
        this.lastPosition = position
    }

    validTime () {
        return this.validSum
    }

    invalidTime () {
        return this.invalidSum
    }
}