import { isSoft, noteState } from "../../../stores/track";
import type { Note } from "../../music/theory/notes";
import { scorer, state } from "./score";

// occupationTracker keeps a track of whether the current depression of a key is occupied by a note that has already been played
// since such a key ought to be played again if it is expected
// The initial (and obvious) naive algorithm simply considered a note to be being played correctly if it was being played at the same time that it was expected in the song
// TODO: simplify into a composition of state machines on each note
export class occupationTracker {
    private states: Map<Note, occupationStatus>; // TODO: make this a Map<Note, occupationStatus> once note reference equality works
    constructor() {
        this.states = new Map<Note, occupationStatus>();
    }

    private apply(note: Note, map: Map<occupationStatus, occupationStatus>) {
        let state = this.stateOf(note)
        if (map.has(state)) {
            this.states.set(note, map.get(state))
        }
    }

    play(note) {
        this.apply(note, new Map([
            [ occupationStatus.nothing, occupationStatus.played ],
            [ occupationStatus.expected, occupationStatus.occupiedCurrent ],
            [ occupationStatus.occupiedPreviousExpected, occupationStatus.occupiedCurrent ],
        ]))
    }

    stop(note: Note) {
        this.apply(note, new Map([
            [ occupationStatus.played, occupationStatus.nothing ],
            [ occupationStatus.occupiedCurrent, occupationStatus.nothing ],
            [ occupationStatus.occupiedPrevious, occupationStatus.nothing ],
            [ occupationStatus.occupiedPreviousExpected, occupationStatus.expected ],
        ]))
    }

    expect(note: Note) {
        this.apply(note, new Map([
            [ occupationStatus.nothing, occupationStatus.expected ],
            [ occupationStatus.played, occupationStatus.occupiedCurrent ],
            [ occupationStatus.occupiedPrevious, occupationStatus.occupiedPreviousExpected ],
        ]))
    }

    unexpect(note: Note) {
        this.apply(note, new Map([
            [ occupationStatus.expected, occupationStatus.nothing ],
            [ occupationStatus.occupiedCurrent, occupationStatus.occupiedPrevious ],
            [ occupationStatus.occupiedPreviousExpected, occupationStatus.occupiedPrevious ],
        ]))
    }

    stateOf(note: Note):occupationStatus {
        if (this.states.has(note)) {
            return this.states.get(note)
        }
        return occupationStatus.nothing
    }

    occupiedPrevious(note):boolean {
        // TODO: do we need `!== occupationStatus.occupiedPrevious` also?
        return this.stateOf(note) === occupationStatus.occupiedPreviousExpected
    }
}

export enum occupationStatus {
    nothing = "nothing", // neither played or expected
    expected = "expected",  // expecting to be occupied"
    played = "played",  // played but unexpected"
    occupiedCurrent = "occupiedCurrent", // occupied by current note
    occupiedPrevious = "occupiedPrevious", // occupied by previous note
    occupiedPreviousExpected = "occupiedPreviousExpected", // occupied by previous note while the next note is expected
}

// getKeyState combines the expected noteState from the track with user input, to determine whether the user is currently playing the note correctly or not.
// TODO: surely make it more concise, especially removing arguments
export function getKeyState(note: Note, activeMap: Map<Note, boolean>) {
    return activeMap.get(note) ? keyState.active : keyState.inactive
}

export enum keyState {
    expecting = 0,
    right,
    active,
    inactive,
    wrong
}