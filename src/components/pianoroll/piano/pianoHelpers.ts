import { Note, Line, InstanceOfNote } from "../../../lib/music/theory/notes";

export class Ghost {}

// returns the black notes between an upper and lower bound and fills in those that don't 
// exist on the piano so they can take some space in the render
export function blackAndGhostBetween(low: Note, high: Note):Array<Note|Ghost> {
    let newNotes: Array<Note|Ghost> = [];
    if (high.lowerThan(low) || high.equals(low)) {
        throw new Error("Low note must be lower than high note")
    }
    
    high = high.next() // runs loop up to highest note, TODO: be more elegant
    while (low.lowerThan(high)) { 
        if (low.getAbstract().accidental) {
            newNotes.push(low)
        } else {
            if (!low.next().getAbstract().accidental && low.next().lowerThan(high)) {
                newNotes.push(new Ghost())
            }
        }
        low = low.next()
    }

    return newNotes
}

export class NoteWidth {
    note: Note;
    width: number;
    constructor(note: Note, width: number) {
        this.note = note;
        this.width = width;
    }
}

// Give a set of white notes the appropriate widths
// B, C, F, and E are 3/4 the width of regular white notes so that the notes in the roll can all be of equal length, and can correspond to the top of the piano (see Design.png for detail)
// TODO: explore non-bisecting desgins with more uniform keys
export function whiteWidths(notes: Array<Note>):Array<NoteWidth> {
    let nws: Array<NoteWidth> = [];
    let totalLength = 0
    notes.forEach((note, i) => {
        if(note.color() != "white") {
            throw new Error("Can only apply whiteWidths to white notes")
        }
        
        let w = width(note, i == 0, i == notes.length - 1)
        totalLength += w
        nws.push(new NoteWidth(note, w))
    });

    let totalpercentage = 0;
    nws.forEach((nw)=> {
        nw.width = (nw.width/totalLength) * 100 // This note's percentage of the total width
        totalpercentage += nw.width
    })

    return nws
}

// gives the proper width to match up with the constant width of the roll section
function width(note: Note, bottomEdge: boolean, topEdge: boolean) {
    switch (note.getAbstract().letter) {
        case "c":
        case "f":
            return topEdge ? 2 : 3;
        case "b":
        case "e":
            return bottomEdge ? 2 : 3;
        default:
            return topEdge || bottomEdge ? 3 : 4
    }
}

export function regularWhiteWidth(notes: Array<Note>) {
    let totalLength = 0
    notes.forEach((note, i) => {
        totalLength += width(note, i == 0, i == notes.length - 1)
    });
    return 4/totalLength
}

let naturalKeys = ["a","s","d","f","g","h","j","k","l"]
let accidentalKeys = ["w","e","r","t","y","u","i","o","p"]
const naturals = makeNaturals()
const accidentals = makeAccidentals()
naturalKeys.push(";")
naturalKeys.push("'")
naturalKeys.push("enter")
accidentalKeys.push("[")
accidentalKeys.push("⏎")

function makeNaturals() {
    let m = naturalKeys.reduce((m, str, i)=>{
        m.set(str.toLocaleUpperCase().charCodeAt(0), i)
        return m
    }, new Map())

    m.set(186, 9)
    m.set(222, 10)
    m.set(13, 11)
    return m
}

function makeAccidentals () {
    let m = accidentalKeys.reduce((m, str, i)=>{
        m.set(str.toLocaleUpperCase().charCodeAt(0), i)
        return m
    }, new Map())

    m.set(219, 9)
    m.set(221, 10)
    return m
}


// Keys the note repsented by a key on the computer keyboard
export function keyboardInputNote(keyCode: number, notes: Line):Note|undefined {
    // Change a bunch
    var index = naturals.get(keyCode)
    if (index !== undefined) {
        return notes.white()[index]
    }

    index = accidentals.get(keyCode)
    if (index !== undefined) {
        let ng = blackAndGhostBetween(notes.notes[0], notes.notes[notes.notes.length-1])[index]
        if (InstanceOfNote(ng)) {
            return <Note>ng
        }
    }
}

export function label(notes: Line):Map<String, String> {
    let m = new Map();
    notes.white().forEach((note, i) => {
        if (i < naturalKeys.length) {
            m.set(note.string(), naturalKeys[i])
        }
    });

    blackAndGhostBetween(notes.notes[0], notes.notes[notes.notes.length-1]).forEach((note, i) => {
        if (i < accidentalKeys.length && InstanceOfNote(note)) {
            let realNote = <Note>note
            m.set(realNote.string(), accidentalKeys[i])
        }
    });
    return m
}

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