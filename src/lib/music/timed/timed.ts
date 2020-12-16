// timed.ts has logic for handled music in time

import type { Note } from "../theory/notes";

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
            let partial = this.partials.get(note.string())
            if (partial != undefined) {
                start = partial.start
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
            // TODO: change all calls to new TimedNote to NewTimedNote so they optionally return no new note
            console.warn("start must be before end: " + start + " " + end)
            if (start > end) {
                let temp = this.start
                this.start = this.end
                this.end = temp
            } else {
                this.end += 0.001
            }
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

    notesFrom(start: number, end: number):Array<TimedNote>{
        if (start >= end) {
            throw new Error("Start must be before end")
        }

        if (this.notes.length == 0) {
            return []
        }

        // binary search to find the first note in the section
        // TODO: add `nextNoteWindow` method that remembers where we last looked so we don't have to do the binary search
        let startIndex = 0
        let endIndex = this.notes.length - 1
        let midpoint = Math.trunc((startIndex + endIndex) / 2)
        while (startIndex != endIndex) {
            let curr = this.notes[midpoint]
            if (curr.start < start) {
                if (startIndex == midpoint) { // handles the final loop
                    startIndex = endIndex
                } else {
                    startIndex = midpoint
                }
            } else {
                endIndex = midpoint
            }
            midpoint = Math.trunc((startIndex + endIndex) / 2)
        }

        // loop through all the notes in the section (assumes we're sorted)
        let i = startIndex
        let notes = []
        while (i < this.notes.length && this.notes[i].start <= end) {
            notes.push(this.notes[i])
            i++
        }

        return notes
    }

    add(note: TimedNote) {
        this.notes.push(note)
        // TODO: run byNotes here(ish)
    }

    sort() {
        this.notes.sort((a: TimedNote, b: TimedNote):number => {
            return a.start - b.start
        })
    }

    // returns the notes in this set
    untime():Array<Note> {
        return this.notes.map(note => {
            return note.note
        })
    }

    // returns all the notes in this set, removing duplicates and timing
    // TODO: merge this and untime
    untimeRemoveDupes():Map<String, boolean> {
        // TODO: surely there's a one liner
        let map = new Map<String, boolean>()
        this.notes.forEach((note)=>{
            map.set(note.note.string(), true)
        })
        return map
    }
}