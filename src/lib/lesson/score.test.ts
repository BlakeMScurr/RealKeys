import { NewNote } from "../music/theory/notes"
import { timedScoreKeeper, state } from "./score"


test("Invalid", () => {
    let sk = new timedScoreKeeper()
    expect(sk.validRatio()).toBeCloseTo(1, 5)
    expect(sk.score()).toBeCloseTo(0, 5)

    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.2)

    expect(sk.invalidTime()).toBeCloseTo(0.1, 5)
    expect(sk.validTime()).toBeCloseTo(0, 5)
    expect(sk.validRatio()).toBeCloseTo(0, 5)
    expect(sk.score()).toBeCloseTo(0, 5)
})

test("Valid", () => {
    let sk = new timedScoreKeeper()

    sk.recordNoteState(NewNote("C", 4), state.valid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.2)

    expect(sk.invalidTime()).toBeCloseTo(0, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(1, 5)
    expect(sk.score()).toBeCloseTo(0.2, 5)
})

test("Mix", () => {
    let sk = new timedScoreKeeper()

    expect(sk.validRatio()).toBeCloseTo(1, 5)
    sk.recordNoteState(NewNote("C", 4), state.valid, 0)
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0.1)
    sk.recordNoteState(NewNote("C", 4), state.indifferent, 0.4)

    expect(sk.invalidTime()).toBeCloseTo(0.3, 5)
    expect(sk.validTime()).toBeCloseTo(0.1, 5)
    expect(sk.validRatio()).toBeCloseTo(0.25, 5)
    expect(sk.score()).toBeCloseTo(0.1, 5)
})

test("Going backwards", () => {
    let sk = new timedScoreKeeper()
    sk.recordNoteState(NewNote("E", 4), state.invalid, 0.1)
    expect(()=>{sk.recordNoteState(NewNote("C", 4), state.valid, 0)}).toThrow("Can't record note state out of order")
})

test("double record" , () => {
    let sk = new timedScoreKeeper()
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0)
    expect(()=>{sk.recordNoteState(NewNote("C", 4), state.valid, 0)}).toThrow("State already recorded for note c4 at position 0")
})