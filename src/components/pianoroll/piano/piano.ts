import type { Note } from "../music/theory/notes";

// gives the ranges of notes between the two given, inclusive
export function notesBetween(low: Note, high: Note) {
    if (high.lowerThan(low)) {
        throw new Error("Highest note lower than lowest note")
    }

    let notes: Array<Note> = [];
    let curr = low
    while (!curr.equals(high)) {
        notes.push(curr)
        curr = curr.next()
    }
    notes.push(curr)

    return notes
}

export class Ghost {}

// takes a set of black notes and fills in those that don't exist on the piano so they can take some space in the render
// assumes they are ordered from top to bottom with no missing notes
export function fillGhosts(notes: Array<Note>) {
    let newNotes: Array<Note|Ghost> = [];
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.color() != "black") {
            throw new Error("Can only fill ghosts for black notes")
        }

        newNotes.push(note)
        if (i != notes.length -1) {
            if (note.next().next().color() != "black") {
                newNotes.push(new Ghost())
                if (!note.next().next().next().equals(notes[i+1])) {
                    throw new Error(note.string() + " should be followed by " + note.next().next().next().string() + " not " + notes[i+1].string())
                }
            } else if (!note.next().next().equals(notes[i+1])) {
                throw new Error(note.string() + " should be followed by " + note.next().next().string() + " not " + notes[i+1].string())
            }
        }
    }
    return newNotes
}

export class NoteWidth {
    note: Note;
    width: number;
    ghost: Ghost;
    constructor(note: Note, width: width) {
        this.note = note;
        this.width = width;
    }
}

// Give a set of white notes the appropriate widths
// B, C, F, and E are 3/4 the width of regular white notes so that the notes in the roll can all be of equal length, and can correspond to the top of the piano (see Design.png for detail)
export function whiteWidths(notes: Array<Note>):Array<NoteWidth> {
    let nws: Array<NoteWidth> = [];
    let totalLength = 0
    notes.forEach(note => {
        if(note.color() != "white") {
            throw new Error("Can only apply whiteWidths to white notes")
        }
        
        totalLength += width(note)
        nws.push(new NoteWidth(note, width(note)))
    });

    let totalpercentage = 0;
    nws.forEach((nw)=> {
        nw.width = (nw.width/totalLength) * 100 // This note's percentage of the total width
        totalpercentage += nw.width
    })

    return nws
}

function width(note: Note) {
    switch (note.abstract.letter) {
        case "b":
        case "c":
        case "f":
        case "e":
            return 3
        default:
            return 4
    }
}

export function regularWhiteWidth(notes: Array<Note>) {
    let totalLength = 0
    notes.forEach(note => {
        totalLength += width(note)
    });
    console.log("regular white width:", 4/totalLength)
    return 4/totalLength
}