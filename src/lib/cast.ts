import { TimedNote, TimedNotes } from "./music/timed/timed"
import { NewNote } from "./music/theory/notes"
import { Bars } from "../components/pianoroll/pianoRollHelpers.ts";


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

export function castBars(bars: any):Bars {
    // TODO: reconcile the two bar types by replacing them with a new type that is fractional and specifies start and end
    return new Bars(bars.map((bar)=>{
        return bar.width
    }))
}