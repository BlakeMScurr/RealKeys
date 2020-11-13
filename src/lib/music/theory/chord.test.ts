import { Chord, ChordBook, sortNotes, squashNotes } from "./chords";
import { Note, NewAbstractNote, NoteOrder, NewNote } from "./notes";

test('inferInversions', () => {
    var b = new ChordBook()
    expect(b.infer("Cmaj7/G")[0]).toEqual(b.infer("Cmaj7")[0].invert(2))
    expect(b.infer("Cmaj7")[0].invert(2).string()).toBe("Cmaj7/G")
})

test('invert', () => {
    var b = new ChordBook()
    var firstInversion = new Chord(nn("e", 4), "", 0)
    firstInversion.inversion = 1
    firstInversion.stack("Minor3rd")
    firstInversion.stack("Perfect4th")
    firstInversion.root = nn("c", 4)
    expect(b.infer("C")[0].invert(1)).toEqual(firstInversion)
})

test('inversions', ()=>{
    var b = new ChordBook()
    var c = b.infer("C")[0]
    expect(c.inversions().map((inv: Chord)=>{return inv.string()})).toEqual(["C", "C/E", "C/G"])
})

test('stack', () => {
    var b = new ChordBook()
    var c = new Chord(nn("b", 4), "", 0)
    c.stack("Semitone")
    expect(c.highest()).toEqual(nn("c", 5))

    c = new Chord(nn("g", 4), "", 0)
    c.stack("Perfect4th")
    expect(c.highest()).toEqual(nn("c", 5))
})

test('newabstractnote', () => {
    expect(NoteOrder.indexOf(nn("c", 4).abstract)).toBe(0)
    expect(NoteOrder.indexOf(nn("a", 4).abstract)).toBe(9)
})

test('lower', () => {
    expect(nn("c", 4).lowerThan(nn("c", 5))).toBe(true)
    expect(nn("f", 3).lowerThan(nn("c", 4))).toBe(true)
    expect(nn("f", 5).lowerThan(nn("c", 4))).toBe(false)
    expect(nn("f", 4).lowerThan(nn("c", 4))).toBe(false)
});

test('sorting', () => {
    expect(sortNotes([nn("a", 5), nn("f", 5), nn("d", 5)])).toEqual([nn("d", 5), nn("f", 5), nn("a", 5)])
    expect(sortNotes([nn("c", 5), nn("a", 4), nn("f", 4)])).toEqual([nn("f", 4), nn("a", 4), nn("c", 5)])
    expect(sortNotes([nn("f", 4), nn("a", 4), nn("c", 5)])).toEqual([nn("f", 4), nn("a", 4), nn("c", 5)])
    expect(sortNotes([nn("f", 5), nn("a", 4), nn("c", 5)])).toEqual([nn("a", 4), nn("c", 5), nn("f", 5)])
})

test('recognisingCMajor', () => {
    var b = new ChordBook()
    var notes: Array<Note> = [
        nn("c", 4),
        nn("g", 4),
        nn("e", 4),
    ]
    var recognisedChord = b.recognise(notes)
    var c4MajorTriad = b.infer("C")[0]
    var c3MajorTriad = b.make(nn("c", 3), "", true, true)

    expect(recognisedChord).toEqual(c4MajorTriad)
    expect(recognisedChord?.symbol).toEqual(c3MajorTriad.symbol)
});

test('recognisingFMajor', () => {
    var b = new ChordBook()
    var notes: Array<Note> = [
        nn("f", 4),
        nn("a", 4),
        nn("c", 5),
    ]
    var recognisedChord = b.recognise(notes)
    var fmajorTriad = b.infer("F")[0]

    expect(recognisedChord).toEqual(fmajorTriad)
});

test('recognisingFMajorFirstInversion', () => {
    var b = new ChordBook()
    var notes: Array<Note> = [
        nn("f", 4),
        nn("a", 3),
        nn("c", 4),
    ]
    var recognisedChord = b.recognise(notes)
    var f4MajorTriad1st = b.infer("F")[0].invert(1)

    expect(recognisedChord).toEqual(f4MajorTriad1st)
});

test('squashingClassicFinalChord', () => {
    expect(squashNotes([
        nn("c", 4),nn("g", 4),nn("e", 5),nn("c", 6)]
    )).toEqual(
        [nn("c", 4),nn("e", 4),nn("g", 4)]
    )

    expect(squashNotes(
        [nn("e", 6), nn("g", 4), nn("g", 5), nn("c", 6)]
    )).toEqual(
        [nn("g", 4), nn("c", 5), nn("e", 5)]
    )
})

test('enharmonicRendering', () => {
    expect(NewAbstractNote("c").enharmonicEquivalent()).toBe("c")
    expect(NewAbstractNote("f").enharmonicEquivalent()).toBe("f")
    expect(NewAbstractNote("b").enharmonicEquivalent()).toBe("b")

    expect(NewAbstractNote("c#").enharmonicEquivalent()).toBe("db")
    expect(NewAbstractNote("f#").enharmonicEquivalent()).toBe("gb")
    expect(NewAbstractNote("a#").enharmonicEquivalent()).toBe("bb")

    expect(NewAbstractNote("ab").string()).toBe("g#")
    expect(NewAbstractNote("eb").string()).toBe("d#")

    var b = new ChordBook()
    // Non sharps should render normally
    expect(b.infer("C")[0].string()).toBe("C")
    expect(b.infer("Fm")[0].string()).toBe("Fm")

    // Flatter chords should render as flat
    expect(b.infer("D#")[0].string()).toBe("Eb")
    expect(b.infer("Eb")[0].string()).toBe("Eb")
    expect(b.infer("G#maj7")[0].string()).toBe("Abmaj7")
    expect(b.infer("Abmaj7")[0].string()).toBe("Abmaj7")

    // Sharper chords should render as sharp
    expect(b.infer("C#m")[0].string()).toBe("C#m")

    // Tricky off beat modal chords
    expect(b.infer("G#dim")[0].string()).toBe("G#dim")
    expect(b.infer("Bbm7b5")[0].string()).toBe("A#m7b5")

    // Slash roots on flatter chords should render as flat if applicable
    expect(b.infer("Eb/A#")[0].string()).toBe("Eb/Bb")
    expect(b.infer("Eb/Bb")[0].string()).toBe("Eb/Bb")

    // // TODO:
    // // Slash chords of accidental notes should render accordingly
    // expect(b.infer("Eb#9/F#")[0].string()).toBe("Eb#9/F#")
    // expect(b.infer("Eb#9/Gb")[0].string()).toBe("Eb#9/Gb")
});

test('recognisingExoticVoicings', () => {
    var b = new ChordBook()

    var c4MajorTriad = b.infer("C")[0]
    var notes: Array<Note> = [nn("c", 4),nn("g", 4),nn("e", 5),nn("c", 6)]
    var recognisedChord = b.recognise(notes)
    expect(recognisedChord).toEqual(c4MajorTriad)

    var c5MajorTriad = b.infer("C")[0]
    notes = [nn("e", 5), nn("g", 3), nn("g", 4), nn("c", 5)]
    var recognisedChord = b.recognise(notes)
    expect(recognisedChord).toEqual(c5MajorTriad.invert(2))

    // add9
    var c5add9 = b.infer("Cadd9")[0]
    notes = [nn("e", 3), nn("g", 3), nn("c", 4), nn("d", 4)]
    var recognisedChord = b.recognise(notes)
    expect(recognisedChord).toEqual(c5add9.invert(1))

    // TODO: get this working, but be aware that add9 inversions may unravel your whole conceptual map
    // Indeed, inversions for root notes about the octave may be the problem. Perhaps we can just squash all chords.
    // notes = [nn("d", 4), nn("e", 4), nn("g", 4), nn("c", 5)]
    // var recognisedChord = b.recognise(notes)
    // expect(recognisedChord).toEqual(c5add9.invert(1))
})

test("NextLowest", ()=>{
    expect(NewNote("C#", 5).nextLowest()).toEqual(NewNote("C", 5))
    expect(NewNote("C", 4).nextLowest()).toEqual(NewNote("B", 3))
    expect(NewNote("F", 4).nextLowest()).toEqual(NewNote("E", 4))
})

test("Interval", ()=>{
    expect(NewNote("C", 4).intervalTo(NewNote("C", 4))).toEqual(0)
    expect(NewNote("C", 4).intervalTo(NewNote("C#", 4))).toEqual(1)
    expect(NewNote("C", 4).intervalTo(NewNote("B", 3))).toEqual(-1)
    expect(NewNote("C", 4).intervalTo(NewNote("C", 5))).toEqual(12)
})

test("Jump", ()=>{
    expect(NewNote("C", 4).jump(-0)).toEqual(NewNote("C", 4))
    expect(NewNote("C", 4).jump(0)).toEqual(NewNote("C", 4))
    expect(NewNote("C", 4).jump(1)).toEqual(NewNote("C#", 4))
    expect(NewNote("C", 4).jump(-1)).toEqual(NewNote("B", 3))
    expect(NewNote("C", 4).jump(-12)).toEqual(NewNote("C", 3))
    expect(NewNote("C", 4).jump(12)).toEqual(NewNote("C", 5))
    expect(NewNote("C", 4).jump(13)).toEqual(NewNote("C#", 5))
})

function nn(note: string, octave: number) {
    return NewNote(note, octave)
}