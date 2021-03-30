export function scales():Array<string> {
    return [
        "Lydian",
        "Major",
        "Mixolydian",
        "Dorian",
        "Minor",
        "Phrygian",
        "Locrian",
        "Whole Tone",
        "Diminished",
    ]
}

export class scaleType {
    private intervals: Array<number>;
    name: string;
    constructor(name: string, intervals: Array<string>) {
        this.name = name
        this.intervals = this.intervals.map((intervalName) => {
            // return semitonesIn
            retur 1
        })
    }
}