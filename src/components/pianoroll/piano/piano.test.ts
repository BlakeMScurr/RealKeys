import { NewNote, notesBetween } from "../../../lib/music/theory/notes"
import { fillGhosts, Ghost } from "./piano"

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

test("FillGhosts", ()=>{
    expect(()=>{fillGhosts([
        NewNote("C", 4),
        NewNote("C", 5),
    ])}).toThrow("Can only fill ghosts for black notes")

    expect(()=>{fillGhosts([
        NewNote("Bb", 4),
        NewNote("Eb", 5),
    ])}).toThrow("a#4 should be followed by c#5 not d#5")

    expect(()=>{fillGhosts([
        NewNote("Ab", 4),
        NewNote("Eb", 5),
    ])}).toThrow("g#4 should be followed by a#4 not d#5")

    expect(fillGhosts([
        NewNote("F#", 4),
        NewNote("G#", 4)
    ])).toEqual([
        NewNote("F#", 4),
        NewNote("G#", 4)
    ])

    expect(fillGhosts([
        NewNote("F#", 4),
        NewNote("G#", 4),
        NewNote("A#", 4)
    ])).toEqual([
        NewNote("F#", 4),
        NewNote("G#", 4),
        NewNote("A#", 4)
    ])

    expect(fillGhosts([
        NewNote("A#", 4),
        NewNote("C#", 5)
    ])).toEqual([
        NewNote("A#", 4),
        new Ghost(),
        NewNote("C#", 5)
    ])

    expect(fillGhosts([
        NewNote("Bb", 4),
        NewNote("Db", 5),
        NewNote("Eb", 5),
        NewNote("Gb", 5),
        NewNote("Ab", 5),
        NewNote("Bb", 5),
    ])).toEqual([
        NewNote("Bb", 4),
        new Ghost(),
        NewNote("Db", 5),
        NewNote("Eb", 5),
        new Ghost(),
        NewNote("Gb", 5),
        NewNote("Ab", 5),
        NewNote("Bb", 5),
    ])
})