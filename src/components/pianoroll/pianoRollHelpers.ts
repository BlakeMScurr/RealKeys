// TODO: get typescript definition and replace all references to "any" type in this file with "Fraction", or whatever the type is
import Fraction from 'fraction.js';
import type { VirtualInstrument } from "../track/instrument";
import { Note, NewNote, notesBetween, highestPianoNote, lowestPianoNote } from "../../lib/music/theory/notes";

// gives a range of keys to present a given set of notes
// - should work with no notes
// - should work with a single note
// - should not be smaller than the absolute minimum size required to keep it pretty
// - must have white notes at top and bottom
const minimumNotes = 7 // approximately a 5th
const defaultStartingNote = NewNote("C", 4) // middle C
export function range(notes: Array<Note>, upperBound: Note, lowerBound: Note):Array<Note> {
    if (upperBound.lowerThan(lowerBound)) {
        throw new Error("lower bound higher than upper bound")
    }

    if (notes.length == 0) {
        notes = [defaultStartingNote]
    }

    for (let i = notes.length - 1; i >= 0; i--) {
        if (notes[i].lowerThan(lowerBound) || upperBound.lowerThan(notes[i])) {
            notes.splice(i, 1)
        }
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

// TODO: encapsulate the 4 push/pop methods into a keys class
export function pushTopKey(keys: Array<Note>, instrument: VirtualInstrument):Boolean {
    let pushed:Boolean = false
    if (keys[keys.length-1].lowerThan(instrument.highest())) {
        keys.push(keys[keys.length-1].next())
        pushed = true
        if (keys[keys.length-1].abstract.accidental) {
            keys.push(keys[keys.length-1].next())
        }
    }
    return pushed
}

export function popTopKey(keys: Array<Note>) {
    keys.pop()
    if (keys[keys.length-1].abstract.accidental) {
        keys.pop()
    }
}

export function popBottomKey(keys: Array<Note>) {
    keys.shift()
    if (keys[0].abstract.accidental) {
        keys.shift()
    }
}

export function pushBottomKey(keys: Array<Note>, instrument: VirtualInstrument):Boolean {
    let pushed:Boolean = false
    if (instrument.lowest().lowerThan(keys[0])) {
        keys.unshift(keys[0].nextLowest())
        pushed = true
        if (keys[0].abstract.accidental) {
            keys.unshift(keys[0].nextLowest())
        }
    }
    return pushed
}