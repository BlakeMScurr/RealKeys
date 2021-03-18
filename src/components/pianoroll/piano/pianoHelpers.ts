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

let naturalKeys = ["a","s","d","f","g","h","j","k","l",";","'","Enter"]
let accidentalKeys = ["w","e","r","t","y","u","i","o","p","[","]"]

// Keys the note repsented by a key on the computer keyboard
export function keyboardInputNote(key: string, notes: Line):Note|undefined {
    // Change a bunch
    var index = naturalKeys.indexOf(key)
    if (index !== -1) {
        return notes.white()[index]
    }

    index = accidentalKeys.indexOf(key)
    if (index !== -1) {
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