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
