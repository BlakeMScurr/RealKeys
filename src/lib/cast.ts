import { TimedNote, TimedNotes } from "./music/timed/timed"
import { NewNote } from "./music/theory/notes"

export function castTimedNotes(notes: any) {
    if (notes === undefined) {
        return new TimedNotes([])
    }

    // TODO: find the proper way to cast
    let ns:Array<TimedNote> = []
    notes.notes.forEach(note => {
        let notestr = note.note.abstract.letter + (note.note.abstract.accidental ? "#":"")
        let nn = NewNote(notestr, note.note.octave)
        ns.push(new TimedNote(note.start, note.end, nn))
    });

    return new TimedNotes(ns)
}