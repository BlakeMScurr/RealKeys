import type { Note } from "./notes";

export const semitonesIn: Map<string, number> = new Map([
    ["Semitone", 1],
    ["Tone", 2],
    ["Minor3rd", 3],
    ["Major3rd", 4],
    ["Perfect4th", 5],
    ["Augmented4th", 6],
    ["Perfect5th", 7],
    ["Minor6th", 8],
    ["Major6th", 9],
    ["Minor7th", 10],
    ["Major7th", 11],
])

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
    ["Lydian", new scaleType("Lydian", transposeUp(major(), 3).slice(0, -1))],
    ["Major", new scaleType("Major", major().slice(0, -1))],
    ["Mixolydian", new scaleType("Mixolydian", transposeUp(major(), 4).slice(0, -1))],
    ["Dorian", new scaleType("Dorian", transposeUp(major(), 1).slice(0, -1))],
    ["Minor", new scaleType("Minor", transposeUp(major(), 5).slice(0, -1))],
    ["Phrygian", new scaleType("Phrygian", transposeUp(major(), 2).slice(0, -1))],
    ["Locrian", new scaleType("Locrian", transposeUp(major(), 6).slice(0, -1))],
    ["Whole Tone", new scaleType("Whole", new Array(5).fill("Tone"))],
    ["Diminished", new scaleType("Diminished", new Array(8).fill("").map((_, i) => { return i % 2 ===0? "Semitone": "Tone"}).slice(0, -1))],
    ["Chromatic", new scaleType("Chromatic", new Array(11).fill("Semitone"))],
])

export function allScales():Array<string> {
    return Array.from(scales.keys())
}