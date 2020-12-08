import { highestPianoNote, lowestPianoNote, NewNote, notesBetween } from "../../lib/music/theory/notes";
import { Bars, popBottomKey, pushBottomKey, pushTopKey, range } from "./pianoRollHelpers"
import type { Note } from "../../lib/music/theory/notes"
import { MockInstrument } from "../track/instrument";
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

const c4 = NewNote("C", 4)
const g4 = NewNote("G", 4)
test("NoteRangeEmpty", ()=>{
    expect(range([], highestPianoNote, lowestPianoNote)).toEqual(notesBetween(c4, g4))
})

test("NoteRangeC4", ()=>{
    expect(range([c4], highestPianoNote, lowestPianoNote)).toEqual(notesBetween(c4, g4))
})

test("NoteRangeC3", ()=>{
    expect(range([NewNote("C", 3)], highestPianoNote, lowestPianoNote)).toEqual(notesBetween(NewNote("C", 3), NewNote("G", 3)))
})

test("NoteRangeC#4", ()=>{
    expect(range([NewNote("C#", 4)], highestPianoNote, lowestPianoNote)).toEqual(notesBetween(c4, g4))
})

test("NoteRangeC#3toG#7", ()=>{
    expect(range([NewNote("C#", 3), NewNote("G#", 7)], highestPianoNote, lowestPianoNote)).toEqual(notesBetween(NewNote("C", 3), NewNote("A", 7)))
})

test("NoteRangeLowerUpperSwitched", ()=>{
    expect(()=>{range([], lowestPianoNote, highestPianoNote)}).toThrow("lower bound higher than upper bound")
})

test("PushPop", () => {
    let piano = new MockInstrument()
    let keys = new Array<Note>(NewNote("C", 4), NewNote("C#", 4))

    pushTopKey(keys, piano)
    expect(keys).toEqual(new Array<Note>(NewNote("C", 4), NewNote("C#", 4),  NewNote("D", 4)))

    popBottomKey(keys)
    expect(keys).toEqual(new Array<Note>(NewNote("D", 4)))

    pushBottomKey(keys, piano)
    expect(keys).toEqual(new Array<Note>(NewNote("C", 4), NewNote("C#", 4),  NewNote("D", 4)))

    // TODO: test edge cases near lowest and highest piano notes
})