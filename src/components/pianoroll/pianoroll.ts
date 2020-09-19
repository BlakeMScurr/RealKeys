import type { Note } from "./music/theory/notes";
import {  notesBetween } from "./music/theory/notes";
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

    // cut off the parts of the bars before the start and after then end
    // then normalise the bars to make them add t o
    truncate(start: number, end: number):Bars {
        if (start >= end) {
            throw new Error("start must be before end")
        }

        let newBars: Array<any> = [];
        let startPos = new Fraction(0);
        this.bars.forEach(bar => {
            let endPos = startPos.add(bar)
            // TODO: suuuuurely this can be made more elegant
            if (startPos <= start && endPos <= start) {
                // do nothing as this bar earlier than the given range
            } else if (startPos <= start && endPos > start) {
                newBars.push(endPos.sub(start))
            } else if (startPos > start && endPos < end) {
                newBars.push(bar)
            } else if (startPos > start && endPos >= end) {
                newBars.push(bar.sub((endPos.sub(end))))
            } else {
                // do nothing as this bar is later than the given range
            }
            startPos = endPos
        });

        // normalise
        let sum = newBars.reduce((prev, curr) => {
            return prev.add(curr)
        }, new Fraction(0));

        newBars = newBars.map((bar)=>{
            return bar.mul(sum.inverse())
        })

        return new Bars(newBars)
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

    truncate(start: number, end: number):TimedNotes {
        throw new Error("TODO")
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

        // the width of the keys in the roll section only correspond to the width of the black notes, or the width of the white notes 

        return notesBetween(lowest, highest)
    }
}