import { NewNote, notesBetween } from "../../../lib/music/theory/notes"
import { blackAndGhostBetween, Ghost, occupationStatus, occupationTracker } from "./piano"

// TODO: shift all my flats to sharps, as that's the internal representation

test("NotesBetween", ()=>{
    expect(notesBetween(NewNote("C", 4), NewNote("Eb", 4))).toEqual([
        NewNote("C", 4),
        NewNote("Db", 4),
        NewNote("D", 4),
        NewNote("Eb", 4)
    ])

    expect(notesBetween(NewNote("C", 4), NewNote("C", 5))).toEqual([
        NewNote("C", 4),
        NewNote("Db", 4),
        NewNote("D", 4),
        NewNote("Eb", 4),
        NewNote("E", 4),
        NewNote("F", 4),
        NewNote("Gb", 4),
        NewNote("G", 4),
        NewNote("Ab", 4),
        NewNote("A", 4),
        NewNote("Bb", 4),
        NewNote("B", 4),
        NewNote("C", 5)
    ])

    expect(()=>{notesBetween(NewNote("Eb", 4), NewNote("C", 4))}).toThrow("Highest note lower than lowest note")
})

test("BlackAndGhostBetween", ()=>{
    expect(blackAndGhostBetween(
        NewNote("C", 4),
        NewNote("C", 5),
    )).toEqual([
        NewNote("C#", 4),
        NewNote("D#", 4),
        new Ghost(),
        NewNote("F#", 4),
        NewNote("G#", 4),
        NewNote("A#", 4),
        new Ghost(),
    ])

    expect(blackAndGhostBetween(
        NewNote("F#", 4),
        NewNote("G#", 4)
    )).toEqual([
        NewNote("F#", 4),
        NewNote("G#", 4)
    ])

    expect(blackAndGhostBetween(
        NewNote("F#", 4),
        NewNote("A#", 4)
    )).toEqual([
        NewNote("F#", 4),
        NewNote("G#", 4),
        NewNote("A#", 4)
    ])

    expect(blackAndGhostBetween(
        NewNote("A#", 4),
        NewNote("C#", 5)
    )).toEqual([
        NewNote("A#", 4),
        new Ghost(),
        NewNote("C#", 5)
    ])

    expect(blackAndGhostBetween(
        NewNote("Bb", 4),
        NewNote("Bb", 5),
    )).toEqual([
        NewNote("Bb", 4),
        new Ghost(),
        NewNote("Db", 5),
        NewNote("Eb", 5),
        new Ghost(),
        NewNote("Gb", 5),
        NewNote("Ab", 5),
        NewNote("Bb", 5),
    ])

    expect(blackAndGhostBetween(
        NewNote("B", 4),
        NewNote("E", 5),
    )).toEqual([
        new Ghost(),
        NewNote("Db", 5),
        NewNote("Eb", 5),
    ])
})


const c4 = NewNote("C", 4)
test("occInitial", () => {
    let ot = new occupationTracker();

    expect(ot.stateOf(c4)).toBe(occupationStatus.nothing)
})

test("occPlay", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.played)
})

test("occPlayStop", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.stop(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.nothing)
})

test("occExpect", () => {
    let ot = new occupationTracker();

    ot.expect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.expected)
})

test("occExpectUnexpect", () => {
    let ot = new occupationTracker();

    ot.expect(c4)
    ot.unexpect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.nothing)
})

test("occCurr", () => {
    let ot = new occupationTracker();

    ot.expect(c4)
    ot.play(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedCurrent)
})

test("occCurrDual", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedCurrent)
})


test("occCurrStop", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    ot.stop(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.nothing) // The alternative is to move to state expected, but then a subsequent play would move to occupiedCurrent, not occupiedPrevious
})

// equivalent to occCurrUnexpect
test("occPrev", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    ot.unexpect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious) 
})

test("occPrevContinued", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    ot.unexpect(c4)
    ot.play(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious) 
    ot.unexpect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious) 
    ot.play(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious) 
})

test("occPrevStop", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    ot.unexpect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious) 
    ot.stop(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.nothing) 
})

test("occPrevStop", () => {
    let ot = new occupationTracker();

    ot.play(c4)
    ot.expect(c4)
    ot.unexpect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPrevious)
    ot.expect(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.occupiedPreviousExpected)
    ot.stop(c4)
    expect(ot.stateOf(c4)).toBe(occupationStatus.expected) 
})

