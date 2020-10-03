// timed.ts has logic for handled music in time

import { NewAbstractNote, Note, NewNote } from "../theory/notes";
import { notesBetween } from "../theory/notes";

class NoteStart {
    start: number;
    note: Note;
    constructor(note: Note, start: number) {
        this.start = start
        this.note = note
    }
}

export class Recorder  {
    private beginning: number;
    private end: number;
    private notes: TimedNotes;
    // Map from the string name of a note, to a timed note with when the note started and an invalid end
    // TODO: this should be a map from timed not to times started, but this was easier
    private partials: Map<String, NoteStart>;

    constructor() {
        this.beginning = -1
        this.end = 1
        this.notes = new TimedNotes([])
        this.partials = new Map<String, NoteStart>();
    }

    start(time: number) {
        if (time > 1) throw new Error("Can't have times greater than 1 as the recorder is normalised to ratios of the song")
        this.beginning = time
    }

    stop(end: number) {
        if (end > 1) throw new Error("Can't have times greater than 1 as the recorder is normalised to ratios of the song")
        this.end = end
    }


    down(note: Note, start: number) {
        if (start > 1) throw new Error("Can't have times greater than 1 as the recorder is normalised to ratios of the song")
        if (this.beginning >= 0) { // Unstarted recorders don't record
            if (start < this.beginning) {
                throw new Error("Note out of recorder bounds")
            }

            if (this.partials.has(note.string())) {
                throw new Error("Note already down")
            }

            this.partials.set(note.string(), new NoteStart(note, start))
        }
    }

    up(note: Note, end: number) {
        if (end > 1) throw new Error("Can't have times greater than 1 as the recorder is normalised to ratios of the song")
        if (this.beginning >= 0) { // Unstarted recorders don't record
            if (end < this.beginning) {
                throw new Error("Note out of recorder bounds")
            }

            let start = this.beginning
            if (this.partials.has(note.string())) {
                start = this.partials.get(note.string()).start
                this.partials.delete(note.string())
            } 

            this.notes.notes.push(new TimedNote(start, end, note))
        }
    }

    getNotes() {
        let notes = JSON.parse(JSON.stringify(this.notes))
        this.partials.forEach((partial)=>{
            notes.notes.push(new TimedNote(partial.start, this.end, partial.note))
        })
        return notes
    }

    // Merges the recorded notes into an existing set of notes
    // Currently just deletes existing notes in the recorded timeframe
    // TODO: if a note is split down the middle keep both halves rather than just the first
    merge(notes: TimedNotes):TimedNotes{
        for (let i = notes.notes.length - 1 ; i >= 0; i--) {
            const note = notes.notes[i];
            // TODO: move succinct if statments
            // delete notes full within the range
            if (note.start > this.beginning && note.end < this.end) {
                notes.notes.splice(i, 1)
            }


            // truncate notes who spill into the range
            if (note.start < this.beginning && note.end > this.beginning) {
                note.end = this.beginning
            }
            
            // truncate notes who start in the range
            if (note.start < this.end && note.end > this.end) {
                note.start = this.end
            }
        }

        notes.notes.push(...this.getNotes().notes)
        notes.notes.sort((a: TimedNote, b: TimedNote)=>{
            return a.start - b.start
        })
        return notes
    }
}

export class TimedNote {
    start: any;
    end: any;
    note: Note;
    constructor(start: any, end: any, note: Note) {
        if (start >= end) {
            throw new Error("start must be before end: " + start + " " + end)
        } 
        this.start = start;
        this.end = end;
        this.note = note;
    }
}

export class TimedNotes {
    notes: Array<TimedNote>;
    constructor(notes: Array<TimedNote>) {
        // check that the notes are in order
        for (let i = 1; i < notes.length; i++) {
            if (notes[i-1].start > notes[i].start) {
                throw new Error("Notes out of order: " +
                    notes[i-1].note.string() + " starts at " +
                    notes[i-1].start + " and " +
                    notes[i].note.string() + " starts at " +
                    notes[i].start)
            }
        }

        this.notes = notes;
    }

    // range is basically specifically for the pianoroll
    // TODO: name/move accordingly
    // TODO: take width of the screen to render into into account
    range():Array<Note> {
        if (this.notes.length == 0) {
            return notesBetween(NewNote("C", 4), NewNote("B", 5))
        }

        let lowest:Note = this.notes[0].note
        let highest:Note = this.notes[0].note

        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i].note;
            if (note.lowerThan(lowest)) {
                lowest = note
            }
            if (highest.lowerThan(note)) {
                highest = note
            }
        }

        // TODO: we should be able to find this without iteration
        while(lowest.abstract.accidental || highest.abstract.accidental) {
            lowest = lowest.nextLowest()
            highest = highest.next()
        }

        return notesBetween(lowest, highest)
    }
}