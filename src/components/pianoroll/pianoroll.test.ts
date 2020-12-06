import { highestPianoNote, lowestPianoNote, NewNote, notesBetween } from "../../lib/music/theory/notes";
import { Bars, range } from "./pianoroll"
var Fraction = require('fraction.js');

function fifthBars():Bars {
    return new Bars([new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5')])
}

test("barLines", ()=>{
    expect(fifthBars().barLines()).toEqual([new Fraction(0), new Fraction("1/5"), new Fraction("2/5"), new Fraction("3/5"), new Fraction("4/5"), new Fraction("1")])
})

test("tooShort", ()=>{
    expect(()=>{ new Bars([new Fraction('1/5')])}).toThrow("Bars don't sum to 1:")
})

test("NoteRange", ()=>{
    const c4 = NewNote("C", 4)
    const g4 = NewNote("G", 4)

    expect(range([], lowestPianoNote, highestPianoNote)).toEqual(notesBetween(c4, g4))
    expect(range([c4], lowestPianoNote, highestPianoNote)).toEqual(notesBetween(c4, g4))
    expect(range([NewNote("C", 3)], lowestPianoNote, highestPianoNote)).toEqual(notesBetween(NewNote("C", 3), NewNote("G", 3)))
    expect(range([NewNote("C#", 4)], lowestPianoNote, highestPianoNote)).toEqual(notesBetween(c4, g4))
    expect(range([NewNote("C#", 3), NewNote("G#", 7)], lowestPianoNote, highestPianoNote)).toEqual(notesBetween(NewNote("C", 3), NewNote("A", 7)))
})