import { noteString } from "../../../lib/music/theory/chords";
import { Note, Line } from "../../../lib/music/theory/notes";

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
        if (low.abstract.accidental) {
            newNotes.push(low)
        } else {
            if (!low.next().abstract.accidental && low.next().lowerThan(high)) {
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
    ghost: Ghost;
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
function width(note: Note, bottomEdge: boolean, topEdge) {
    switch (note.abstract.letter) {
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

const naturals = ["a","s","d","f","g","h","j","k","l",";"]
const accidentals = ["w","e","r","t","y","u","i","o","p","["]
// Keys the note repsented by a key on the computer keyboard
export function keyboardInputNote(keyCode: number, notes: Line):Note {
    let key: string = String.fromCharCode(keyCode).toLocaleLowerCase()

    var index = naturals.indexOf(key)
    if (index != -1) {
        return notes.white()[index]
    }

    index = accidentals.indexOf(key)
    if (index != -1) {
        let ng = blackAndGhostBetween(notes.notes[0], notes.notes[notes.notes.length-1])[index]
        if (ng instanceof Note) {
            return <Note>ng
        }
    }
}

export function label(notes: Line):Map<String, String> {
    let m = new Map();
    notes.white().forEach((note, i) => {
        if (i < naturals.length) {
            m.set(note.string(), naturals[i])
        }
    });

    blackAndGhostBetween(notes.notes[0], notes.notes[notes.notes.length-1]).forEach((note, i) => {
        if (i < accidentals.length && note instanceof Note) {
            m.set(note.string(), accidentals[i])
        }
    });
    return m
}