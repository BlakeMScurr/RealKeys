import { GameMaster } from "../../stores/stores"
import { NewNote } from "../music/theory/notes"
import { timedScoreKeeper, state } from "./score"


test("Invalid", () => {
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

test("ValidAttempt", () => {
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

test("Mix", () => {
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

test("double record" , () => {
    let gm = new GameMaster()
    let sk = new timedScoreKeeper(gm.position, 1)
    let score;
    sk.subscribe((s) => { score = s })
    sk.recordNoteState(NewNote("C", 4), state.invalid, 0)
    expect(()=>{sk.recordNoteState(NewNote("C", 4), state.valid, 0)}).toThrow("State already recorded for note c4 at position 0")
})

test("MultiNote", () => {
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

test("Leniency", () => {
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