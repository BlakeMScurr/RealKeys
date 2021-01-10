// timed.ts has logic for handled music in time

import { highestPianoNote, lowestPianoNote, Note } from "../theory/notes";

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
    velocity: number;
    constructor(start: any, end: any, note: Note, velocity: number=1) {
        if (start >= end) {
            // TODO: change all calls to new TimedNote to NewTimedNote so they optionally return no new note
            // console.warn("start must be before end: " + start + " " + end)
            if (start > end) {
                let temp = this.start
                this.start = this.end
                this.end = temp
            } else {
                this.end += 0.001
            }
        } 
        this.velocity = velocity
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

        
        let toDelete = []
        notes.forEach((earlierNote, i) => {
            for (var j = i + 1; j < notes.length; j++) {
                if (earlierNote.end < notes[j].start) {
                    break
                }
                
                if (earlierNote.end > notes[j].start && notes[j].note.equals(earlierNote.note)){
                    // console.warn("note overlap")
                    if (earlierNote.start === notes[j].start) {
                        // This removes any doubled up notes in a given track
                        // Some midi files appear to have doubled notes, that is, you are supposed to play a C4, for example, then play another C4
                        // without stopping the original note. In the case where I first found it, every single note in some tracks was doubled.
                        // This caused major issues with wait mode, and it seems likely that it could cause other issues.
                        // I can't think of an example where one would play the same note in the same track without stopping the first.
                        // TODO: figure out whether it's an issue with the tonesjs/midi library, or the midi files themselves.
                        // When we open the file with this tool https://onlinesequencer.net/import2/dcdfb44f4c34437373aae19b7d7c4b10?title=TheGirlFromIpanema.mid we can
                        // see the double up, but not with musescore. This could either be because onlinesequencer.net has the same bug as us, or because
                        // musescore cleverly deletes the notes like we do now. The relevant file is amongst the midi assets at T/T/TheGirlFromIpanema.mid
                        toDelete.push(j)
                    } else {
                        // Example of overlap here in http://localhost:3000/learn/%2FJ%2FJ%2Fjustin_bieber-baby.mid `acoustic guitar (nylon) 0` at the first held chord
                        // where the Eb overlaps with the previous one.
                        earlierNote.end = notes[j].start
                    }
                }
            }
        })

        // Sometimes we have super low notes that are intentionally out of range that store data like the author of the midi file and their email address etc. These should
        // not be parsed as actual notes, hence they're cut off here.
        // Example in the `lead 3 (calliope)` in http://localhost:3000/learn/%2FJ%2FJ%2Fjustin_bieber-baby.mid
        notes.forEach((note, i) => {
            if (note.note.lowerThan(lowestPianoNote) || highestPianoNote.lowerThan(note.note)) {
                toDelete.push(i)
            }
        })
        
        toDelete = [...new Set(toDelete)]

        toDelete.sort().reverse().forEach(i => {
            notes.splice(i, 1)
        })
        
        this.notes = notes;
    }

    notesFrom(start: number, end: number):Array<TimedNote>{
        if (start >= end) {
            // console.warn("Start must be before end")
            return []
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