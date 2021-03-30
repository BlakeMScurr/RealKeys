import { semitonesIn } from "./chords"
import { AbstractNote, NewNote, Note } from "./notes";

export class scaleType {
    intervals: Array<number>;
    name: string;
    constructor(name: string, intervals: Array<string>) {
        this.name = name
        this.intervals = intervals.map((intervalName) => {
            if (!semitonesIn.has(intervalName)) {
                throw new Error(`Interval name ${intervalName} invalid`)
            }
            return semitonesIn.get(intervalName)
        })
    }
}

export class scale {
    notes: Array<Note>;
    constructor(root: Note, tonality: string) {
        if (!scales.has(tonality)) {
            throw new Error(`There's no scale called ${tonality}`)
        }

        let notes: Array<Note> = [root];

        scales.get(tonality).intervals.forEach((interval) => {
            let lastNote = notes[notes.length-1]
            notes.push(lastNote.jump(interval))
        })

        this.notes = notes
    }
}

function major () {
    return ["Tone", "Tone", "Semitone", "Tone", "Tone", "Tone", "Semitone"]
}

function transposeUp(arr, i) {
    while (i > 0) {
        arr.push(arr.shift(0))
        i--
    }
    return arr
}

const scales: Map<string, scaleType> = new Map([
    ["Lydian", new scaleType("Lydian", transposeUp(major(), 3))],
    ["Major", new scaleType("Major", major())],
    ["Mixolydian", new scaleType("Mixolydian", transposeUp(major(), 4))],
    ["Dorian", new scaleType("Dorian", transposeUp(major(), 1))],
    ["Minor", new scaleType("Minor", transposeUp(major(), 5))],
    ["Phrygian", new scaleType("Phrygian", transposeUp(major(), 2))],
    ["Locrian", new scaleType("Locrian", transposeUp(major(), 6))],
    ["Whole Tone", new scaleType("Whole", new Array(6).fill("Tone"))],
    ["Diminished", new scaleType("Diminished", new Array(8).fill("").map((_, i) => { return i % 2 ===0? "Semitone": "Tone"}))],
])

export function allScales():Array<string> {
    return Array.from(scales.keys())
}