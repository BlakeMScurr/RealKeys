import { GameMaster } from "../../../stores/stores"
import { noteState } from "../../../stores/track"
import { NewNote } from "../../music/theory/notes"
import { timedScoreKeeper, state, untimedScoreKeeper } from "./score"
import { occupationStatus, occupationTracker } from "./stateTracking"



test("timed/Invalid", () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })


    expect(sk.validRatio()).toBeCloseTo(1, 5)
    expect(score).toBeCloseTo(0, 5)

    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.2)
    gm.seek.set(0.2)

    expect(sk.invalidTime()).toBeCloseTo(0.1, 5)
    expect(sk.validTime()).toBeCloseTo(0, 5)
    expect(sk.validRatio()).toBeCloseTo(0, 5)
    expect(score).toBeCloseTo(0, 5)
})

test("timed/ValidAttempt", () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })

    sk.recordNoteState(NewNote("C", 4), state.valid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.2)
    gm.seek.set(0.2)

    expect(sk.invalidTime()).toBeCloseTo(0, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(1, 5)
    expect(score).toBeCloseTo(0.2, 5)
})

test("timed/Mix", () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })

    expect(sk.validRatio()).toBeCloseTo(1, 5)
    sk.recordNoteState(NewNote("C", 4), state.valid, 0)
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.4)
    gm.seek.set(0.4)


    expect(sk.invalidTime()).toBeCloseTo(0.3, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(0.25, 5)
    expect(score).toBeCloseTo(0.1, 5)
})

test("timed/double record" , () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0)
    expect(()=>{sk.recordNoteState(NewNote("C", 4), state.valid, 0)}).toThrow("State already recorded for note c4 at position 0")
})

test("timed/MultiNote", () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })

    expect(sk.validRatio()).toBeCloseTo(1, 5)
    sk.recordNoteState(NewNote("C", 4), state.valid, 0)
    sk.recordNoteState(NewNote("D", 4), state.invalid, 0)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.1)
    sk.recordNoteState(NewNote("D", 4), state.indifferent, 0.1)
    gm.seek.set(0.1)


    expect(sk.invalidTime()).toBeCloseTo(0.1, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(0.5, 5)
    expect(score).toBeCloseTo(0.05, 5)
})

test("timed/Leniency", () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 0.75)
    let score;
    sk.subscribe((s) => { score = s })

    sk.recordNoteState(NewNote("C", 4), state.valid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.2)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.3)
    gm.seek.set(0.3)

    expect(sk.invalidTime()).toBeCloseTo(0.1, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(2/3, 5)
    expect(score).toBeCloseTo(0.2, 5)
})

test("untimed/Double note", () => {
    let gm = new GameMaster()
    let sk = new untimedScoreKeeper(3, 1)
    let score;
    sk.subscribe((s) => { score = s })

    // wrongly play a C
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.inputChange()

    // rightly play a C
    sk.expect(new Map([[NewNote("C", 4), noteState.expecting]]))
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.valid, 0.2)

    // rightly stop playing
    sk.inputChange()
    sk.expect(new Map())
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.3)
    
    // rightly play a C
    sk.inputChange()
    sk.expect(new Map([[NewNote("C", 4), noteState.expecting]]))
    sk.recordNoteState(NewNote("C", 4), state.valid, 0.4)
    gm.seek.set(0.3)

    expect(sk.invalidTime()).toBe(1)
    expect(sk.validTime()).toBe(2)
    expect(sk.validRatio()).toBeCloseTo(2/3, 5)
    expect(score).toBeCloseTo(4/9, 5) // we got 2/3, and we hit an invalid, giving us a 2/3 hits being right, giving (2/3)^2 = 4/9
})

test("untimed/Double dip", () => {
    let gm = new GameMaster()
    let sk = new untimedScoreKeeper(2, 1)
    let score;
    sk.subscribe((s) => { score = s })

    // wrongly play a C
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.inputChange()

    // rightly play a C
    sk.expect(new Map([[NewNote("C", 4), noteState.expecting]]))
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.valid, 0.2)

    // indifferently stop playing
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.3)

    // indifferently play a C
    sk.inputChange()
    sk.recordNoteState(NewNote("C", 4), state.valid, 0.4)
    gm.seek.set(0.3)

    expect(sk.invalidTime()).toBe(1)
    expect(sk.validTime()).toBe(1)
    expect(sk.validRatio()).toBeCloseTo(1/2, 5)
    expect(score).toBeCloseTo(1/4, 5) // we got 1/2 valid notes right, and 1/2 of the notes we hit was valid, giving 1/4
})

const c4 = () => { return NewNote("C", 4) }
test("occInitial", () => {
    let ot = new occupationTracker();

    expect(ot.stateOf(c4())).toBe(occupationStatus.nothing)
})

test("occPlay", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.played)
})

test("occPlayStop", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.stop(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.nothing)
})

test("occExpect", () => {
    let ot = new occupationTracker();

    ot.expect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.expected)
})

test("occExpectUnexpect", () => {
    let ot = new occupationTracker();

    ot.expect(c4())
    ot.unexpect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.nothing)
})

test("occCurr", () => {
    let ot = new occupationTracker();

    ot.expect(c4())
    ot.play(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedCurrent)
})

test("occCurrDual", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedCurrent)
})


test("occCurrStop", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    ot.stop(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.nothing) // The alternative is to move to state expected, but then a subsequent play would move to occupiedCurrent, not occupiedPrevious
})

// equivalent to occCurrUnexpect
test("occPrev", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    ot.unexpect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious) 
})

test("occPrevContinued", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    ot.unexpect(c4())
    ot.play(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious) 
    ot.unexpect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious) 
    ot.play(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious) 
})

test("occPrevStop", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    ot.unexpect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious) 
    ot.stop(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.nothing) 
})

test("occPrevStop", () => {
    let ot = new occupationTracker();

    ot.play(c4())
    ot.expect(c4())
    ot.unexpect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPrevious)
    ot.expect(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.occupiedPreviousExpected)
    ot.stop(c4())
    expect(ot.stateOf(c4())).toBe(occupationStatus.expected) 
})
