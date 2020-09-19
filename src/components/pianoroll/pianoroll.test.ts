import { NewNote } from "./music/theory/notes"
import { Bars, TimedNote, TimedNotes } from "./pianoroll"
var Fraction = require('fraction.js');

function fifthBars():Bars {
    return new Bars([new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5'), new Fraction('1/5')])
}

test("TruncateBarsWidthError", ()=> {
    expect(()=>{new Bars([new Fraction('1/10'), new Fraction('1/10'), new Fraction('1/10'), new Fraction('1/10'), new Fraction('1/10')]).truncate(1, 0)}).toThrow("Bars don't sum to 1: 0.5")
})

test("TruncateBarsRangeError", ()=> {
    expect(()=>{fifthBars().truncate(1, 0)}).toThrow("start must be before end")
})

test("TruncateBarsNoEffect", ()=> {
    expect(fifthBars().truncate(0, 1)).toEqual(fifthBars())
})

test("TruncateBarsStartSlice", ()=> {
    expect(fifthBars().truncate(0.5, 1)).toEqual(new Bars([new Fraction('1/5'), new Fraction('2/5'), new Fraction('2/5')]))
})

test("barLines", ()=>{
    expect(fifthBars().barLines()).toEqual([new Fraction(0), new Fraction("1/5"), new Fraction("2/5"), new Fraction("3/5"), new Fraction("4/5"), new Fraction("1")])
})

test("NotesErroringNew", ()=>{
    expect(()=>{new TimedNotes([new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("d", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).toThrow("Notes out of order: d4 starts at 0.1 and c4 starts at 0")
})

test("NotesNotErroringNew", ()=>{
    expect(()=>{new TimedNotes([new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4))])}).not.toThrow("Notes out of order")
    expect(()=>{new TimedNotes([new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).not.toThrow("Notes out of order")
})