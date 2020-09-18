import type { Note } from "./music/theory/notes";

// TODO: merge this will all the places we're using bars in the ZoomBars thign
export class Bars {
    bars: Array<number>;
    constructor(bars: Array<number>) {
        let sum = bars.reduce((prev, curr) => {
            return prev + curr
        }, 0);
        if (sum != 1) {
            throw new Error("Bars don't sum to 1: " + sum)
        }
        this.bars = bars
    }

    barLines():Array<number> {
        let starts:Array<number> = [];
        let sum = 0;
        this.bars.forEach(barLength => {
            starts.push(sum)
            sum += barLength
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

        let newBars: Array<number> = [];
        let startPos = 0;
        this.bars.forEach(bar => {
            let endPos = startPos + bar
            // TODO: suuuuurely this can be made more elegant
            if (startPos <= start && endPos <= start) {
                console.log(1)
                // do nothing as this bar earlier than the given range
            } else if (startPos <= start && endPos > start) {
                console.log(2)
                newBars.push(endPos - start)
            } else if (startPos > start && endPos < end) {
                console.log(3)
                newBars.push(bar)
            } else if (startPos > start && endPos >= end) {
                console.log(4)
                newBars.push(bar - (endPos - end))
            } else {
                console.log(5)
                // do nothing as this bar is later than the given range
            }
            startPos = endPos
        });

        // normalise
        let sum = newBars.reduce((prev, curr) => {
            return prev + curr
        }, 0);
        newBars = newBars.map((bar)=>{
            return bar * 1/sum
        })

        return new Bars(newBars)
    }
}

export class TimedNote {
    start: number;
    end: number;
    note: Note;
    constructor(start: number, end: number, note: Note) {
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
}