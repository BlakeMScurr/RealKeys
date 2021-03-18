import type { Readable } from "svelte/types/runtime/store";
import { noteState } from "../../../stores/track";
import type { Note } from "../../music/theory/notes";
import type { TimedNotes } from "../../music/timed/timed";
import { get } from "../../util";

export enum state {
    valid = "valid",
    invalid = "invalid",
    indifferent = "indifferent",
}

export interface scorer {
    validRatio():number
    recordNoteState(note: Note, s: state, position: number)
    subscribe(f) // TODO: return an unsubscriber
    reset()

    // specifically required for the untimed scorer
    inputChange()
    expect(notes: Map<Note, noteState>)
}

const defaultLeniency = 0.85
// TODO: create an explicit link between the two types of score keeps and our modes
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

    // TODO: remove repeated code between constructor and reset
    reset() {
        this.validSum = 0
        this.invalidSum = 0
        this.lastNotePositions = new Map<string, number>();
        this.lastNoteStates = new Map<string, state>();
        this.subscribers = []
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
    expect(notes: Map<Note, noteState>){}
}

enum satisfaction {
    notExpected = "notExpected", // TODO: remove, as we may have encoded this as non existence in the satisfaction map
    expected = "expected",
    satisfied = "satisfied",
}
export class untimedScoreKeeper {
    private validSum: number;
    private invalidSum: number;
    private subscribers;
    private lastNoteStates: Map<string, state>;
    private leniency: number;
    private inputHasChanged: boolean;
    private expectations: Map<Note, satisfaction>;
    private total: number;

    constructor(total: number, leniency?: number) {
        this.total = total
        this.validSum = 0
        this.invalidSum = 0
        this.subscribers = []
        this.lastNoteStates = new Map();
        this.leniency = leniency !== undefined ? leniency : defaultLeniency
        this.inputHasChanged = true
        this.expectations = new Map();
    }

    // TODO: remove repeated code between constructor and reset
    reset() {
        this.validSum = 0
        this.invalidSum = 0
        this.subscribers = []
        this.lastNoteStates = new Map();
        this.inputHasChanged = true
        this.expectations = new Map();
        this.triggerScoreUpdate(0)
    }

    validRatio():number {
        let total = this.validTime() + this.invalidTime()
        if (total > 0) {
            return this.validTime() / total / this.leniency
        } else if (total < 0) {
            throw new Error("Can't have negative time")
        }
        return 0 // start at 0 so that the default appearance of the score bar isn't so appealing to click on
    }

    recordNoteState(note: Note, s: state, position: number) {
        // Check that the state of this note has actually changed between calls to recordNoteState
        if (this.lastNoteStates.has(note.string()) && this.lastNoteStates.get(note.string()) === s) {
            return
        }
        this.lastNoteStates.set(note.string(), s)

        // Why only update the score if the user's input has changed?
        // The state may have changed as the piece proceeded to the next note,
        // and in wait mode we do not expect someone to change input in order to accomodate that,
        // we only expect them to enter the next note correctly
        if (this.inputHasChanged) {
            if (s === state.valid &&this.expectations.get(note) !== satisfaction.satisfied) {
                this.validSum++
                if (this.expectations.get(note) === satisfaction.expected) {
                    this.expectations.set(note, satisfaction.satisfied)
                }
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

    // In wait mode you don't get extra points for hitting the same note multiple times
    // So we record a which notes have already been played by accepting which ones are expected here
    // and updating whether they're satisfied as we record the score
    expect(notes: Map<Note, noteState>) {
        // Set notes as expected
        this.expectations.forEach((_, note) => {
            this.expectations.delete(note)
        })
        
        notes.forEach((state, note) => {
            if (state === noteState.expecting && !this.expectations.has(note)) {
                this.expectations.set(note, satisfaction.expected)
            }
        })
    }

    triggerScoreUpdate(pos: number) {
        const score = this.validRatio() * (this.validSum/this.total)
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

export class staticScoreKeeper {
    validRatio():number { return 1 }
    inputChange() {}
    recordNoteState(note: Note, s: state, position: number) {}
    subscribe(f){}
    expect(notes: Map<Note, noteState>){}
    reset(){}
}