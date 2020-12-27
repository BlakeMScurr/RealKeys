import { NewNote } from "../theory/notes";
import { Recorder, TimedNote, TimedNotes } from "./timed"
var Fraction = require('fraction.js');

test("RecorderUnStarted", ()=>{
    let r = new Recorder();
    expect(()=>{r.down(NewNote("C", 4), 0)}).not.toThrow("")
    expect(()=>{r.up(NewNote("C", 4), 1)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([]))
})

test("RecorderValid", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.down(NewNote("C", 4), 0)}).not.toThrow("")
    expect(()=>{r.up(NewNote("C", 4), 1)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 1, NewNote("C", 4))]))
})

test("RecorderEnd", ()=> {
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.down(NewNote("C", 4), 0)}).not.toThrow("")
    r.stop(0.75)
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 0.75, NewNote("C", 4))]))
})

test("RecorderOutOfBounds", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.down(NewNote("C", 4), 2)}).toThrow("Can't have times greater than 1 as the recorder is normalised to ratios of the song")
    expect(r.getNotes()).toEqual(new TimedNotes([]))
})

test("RecorderAlreadyStarted", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.down(NewNote("C", 4), 0)}).not.toThrow("")
    expect(()=>{r.down(NewNote("C", 4), 0.5)}).toThrow("Note already down")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 1, NewNote("C", 4))]))
})

test("RecorderUpBeforeDown0", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.up(NewNote("C", 4), 1)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 1, NewNote("C", 4))]))
})

test("RecorderUpBeforeDown1", ()=>{
    let r = new Recorder();
    r.start(0.5)
    expect(()=>{r.up(NewNote("C", 4), 1)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0.5, 1, NewNote("C", 4))]))
})

test("RecorderOutOfBounds", ()=>{
    let r = new Recorder();
    r.start(1)
    expect(()=>{r.down(NewNote("C", 4), 0)}).toThrow("")
    expect(()=>{r.up(NewNote("C", 4), 0)}).toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([]))
})

test("MergeFullReplace", ()=>{
    let r = new Recorder();
    r.start(0)
    r.down(NewNote("C", 4), 0)
    r.up(NewNote("C", 4), 1)

    expect(r.merge(new TimedNotes([new TimedNote(0.067, 0.3, NewNote("G#", 3))])))
        .toEqual(new TimedNotes([new TimedNote(0, 1, NewNote("C", 4))]))
})

test("MergeClean", ()=>{
    let r = new Recorder();
    r.start(0)
    r.down(NewNote("C", 4), 0)
    r.up(NewNote("C", 4), 0.5)

    expect(r.merge(new TimedNotes([new TimedNote(0.5, 1, NewNote("E", 3))])))
        .toEqual(new TimedNotes([new TimedNote(0, 0.5, NewNote("C", 4)), new TimedNote(0.5, 1, NewNote("E", 3))]))
})

test("MergeTruncateBothSides", ()=>{
    let r = new Recorder();
    r.start(0.4)
    r.down(NewNote("A", 3), 0.4)
    r.up(NewNote("A", 3), 0.6)
    r.stop(0.6)

    expect(r.merge(new TimedNotes([new TimedNote(0, 0.5, NewNote("E", 4)), new TimedNote(0.5, 1, NewNote("G", 3))])))
        .toEqual(new TimedNotes([new TimedNote(0, 0.4, NewNote("E", 4)), new TimedNote(0.4, 0.6, NewNote("A", 3)), new TimedNote(0.6, 1, NewNote("G", 3))]))
})

test("FailedNewNote", ()=>{
    // TODO: retvrn
    // expect(()=>{new TimedNote(new Fraction("2/10"), new Fraction("1/10"), NewNote("d", 4))}).toThrow("start must be before end")
    expect(()=>{new TimedNote(new Fraction("2/10"), new Fraction("1/10"), NewNote("d", 4))}).not.toThrow("")
})

test("NotesErroringNew", ()=>{
    expect(()=>{new TimedNotes([new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("d", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).toThrow("Notes out of order: d4 starts at 0.1 and c4 starts at 0")
})

test("NotesNotErroringNew", ()=>{
    expect(Cs).not.toThrow("Notes out of order")
    expect(()=>{new TimedNotes([new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).not.toThrow("Notes out of order")
})

test("NotesFrom0to0.01", ()=>{
    expect(Cs().notesFrom(0, 0.01)).toEqual([ new TimedNote(0, new Fraction("1/10"), NewNote("c", 4))])
})

test("NotesFrom0to0.1", ()=>{
    expect(LoadsOfCs().notesFrom(0, 0.1)).toEqual([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0to0.31", ()=>{
    expect(LoadsOfCs().notesFrom(0, 0.31)).toEqual([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("2/10"), new Fraction("3/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("3/10"), new Fraction("4/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0.3to0.61", ()=>{
    expect(LoadsOfCs().notesFrom(0.3, 0.61)).toEqual([
        new TimedNote(new Fraction("3/10"), new Fraction("4/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("4/10"), new Fraction("5/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("5/10"), new Fraction("6/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("6/10"), new Fraction("7/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0.4to0.61", ()=>{
    expect(LoadsOfCs().notesFrom(0.4, 0.61)).toEqual([
        new TimedNote(new Fraction("4/10"), new Fraction("5/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("5/10"), new Fraction("6/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("6/10"), new Fraction("7/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0.6to0.61", ()=>{
    expect(LoadsOfCs().notesFrom(0.6, 0.61)).toEqual([
        new TimedNote(new Fraction("6/10"), new Fraction("7/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0.9to1", ()=>{
    expect(LoadsOfCs().notesFrom(0.9, 1)).toEqual([
        new TimedNote(new Fraction("9/10"), new Fraction("10/10"), NewNote("c", 4)),
    ])
})

test("NotesFrom0.9to7000", ()=>{
    expect(LoadsOfCs().notesFrom(0.9, 7000)).toEqual([
        new TimedNote(new Fraction("9/10"), new Fraction("10/10"), NewNote("c", 4)),
    ])
})

test ("DoubledUpNotes", ()=> {
    // TODO: expect console warn
    expect((new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
    ]))).toEqual(new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
    ]))
})
test ("DoublyDoubledUpNotes", ()=> {
    // TODO: expect console warn
    expect((new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
    ]))).toEqual(new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
    ]))
})
    
test("SimulatneousNotes", ()=> {
    expect((new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(0, new Fraction("1/10"), NewNote("d", 4)), 
    ]))).toEqual(new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(0, new Fraction("1/10"), NewNote("d", 4)), 
    ]))
})

test("TruncateNotes", () => {
    expect((new TimedNotes([
        new TimedNote(0, new Fraction("2/10"), NewNote("c", 4)), 
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4)), 
    ]))).toEqual(new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4)), 
    ]))
})

test("OutOfRangeNotes", () => {
    expect((new TimedNotes([
        new TimedNote(0, new Fraction("2/10"), NewNote("c", -1)),
    ]))).toEqual(new TimedNotes([]))
})

function Cs() {
    return new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4))
    ])
}

function LoadsOfCs() {
    return new TimedNotes([
        new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), 
        new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("2/10"), new Fraction("3/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("3/10"), new Fraction("4/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("4/10"), new Fraction("5/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("5/10"), new Fraction("6/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("6/10"), new Fraction("7/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("7/10"), new Fraction("8/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("8/10"), new Fraction("9/10"), NewNote("c", 4)),
        new TimedNote(new Fraction("9/10"), new Fraction("10/10"), NewNote("c", 4)),
    ])
}