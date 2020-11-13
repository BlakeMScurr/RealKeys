// TODO: get typescript definition and replace all references to "any" type in this file with "Fraction", or whatever the type is
import Fraction from 'fraction.js';

import { Note, NewNote, notesBetween, highestPianoNote } from "../../lib/music/theory/notes";

// gives a range of keys to present a given set of notes
// - should work with no notes
// - should work with a single note
// - should not be smaller than the absolute minimum size required to keep it pretty
// - must have white notes at top and bottom
const minimumNotes = 7 // approximately a 5th
const defaultStartingNote = NewNote("C", 4) // middle C
export function range(notes: Array<Note>, upperBound: Note, lowerBound: Note):Array<Note> {
    if (notes.length == 0) {
        notes = [defaultStartingNote]
    }

    let lowest:Note = notes[0]
    let highest:Note = notes[0]

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.lowerThan(lowest)) {
            lowest = note
        }
        if (highest.lowerThan(note)) {
            highest = note
        }
    }

    if (lowest.abstract.accidental) {
        lowest = lowest.nextLowest()
    }

    if (lowest.intervalTo(highest) < minimumNotes) {
        highest = lowest.jump(minimumNotes)
    }

    if (highest.abstract.accidental) {
        highest = highest.next()
    }

    return notesBetween(lowest, highest)
}

// TODO: merge this will all the places we're using bars in the ZoomBars thign
export class Bars {
    bars: Array<any>;
    constructor(bars: Array<any>) {
        let sum = bars.reduce((prev, curr) => {
            return prev.add(curr)
        }, new Fraction(0));
        if (sum != 1) {
            // TODO: revert
            // throw new Error("Bars don't sum to 1: " + sum)
            console.error("Bars don't sum to 1: " + sum)
        }

        this.bars = bars
    }

    barLines():Array<Fraction> {
        let starts:Array<Fraction> = [];
        let sum = new Fraction(0);
        this.bars.forEach(barLength => {
            starts.push(sum)
            sum = sum.add(barLength)
        });
        starts.push(sum)
        return starts
    }

    sums():Array<number> {
        let sum = 0;
        let newBars:Array<number> = [0];
        this.bars.forEach(bar => {
            sum += bar
            newBars.push(sum)
        });
        return newBars
    }
}