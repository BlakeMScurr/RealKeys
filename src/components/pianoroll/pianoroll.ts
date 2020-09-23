import { NewAbstractNote, NewNote, Note } from "../../lib/music/theory/notes";
import { notesBetween } from "../../lib/music/theory/notes";
// TODO: import as normal
// TODO: get typescript definition and replace all references to "any" type in this file with "Fraction", or whatever the type is
var Fraction = require('fraction.js');

// TODO: merge this will all the places we're using bars in the ZoomBars thign
export class Bars {
    bars: Array<any>;
    constructor(bars: Array<any>) {
        let sum = bars.reduce((prev, curr) => {
            return prev.add(curr)
        }, new Fraction(0));
        if (sum != 1) {
            throw new Error("Bars don't sum to 1: " + sum)
        }


        this.bars = bars
    }

    barLines():Array<number> {
        let starts:Array<number> = [];
        let sum = Fraction(0);
        this.bars.forEach(barLength => {
            starts.push(sum)
            sum = sum.add(barLength)
        });
        starts.push(sum)
        return starts
    }

    sums():Array<number> {
        let sum = 0;
        let newBars:Array<number> = [];
        this.bars.forEach(bar => {
            sum += bar
            newBars.push(sum)
        });
        return newBars
    }
}

export class TimedNote {
    start: any;
    end: any;
    note: Note;
    constructor(start: any, end: any, note: Note) {
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

    range():Array<Note> {
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

        // the width of the keys in the roll section only correspond to the width of the black notes, or the width of the and there will be a mismatch
        // if our lowest note isn't C or F, and the highest isn't B or E
        while (lowest.abstract != NewAbstractNote("C") && lowest.abstract != NewAbstractNote("F")) {
            lowest = lowest.nextLowest()
        }

        while (highest.abstract != NewAbstractNote("B") && highest.abstract != NewAbstractNote("E")) {
            highest = highest.next()
        }

        return notesBetween(lowest, highest)
    }
}