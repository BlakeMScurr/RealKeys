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
    r.stop(2)
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 2, NewNote("C", 4))]))
})

test("RecorderAlreadyStarted", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.down(NewNote("C", 4), 0)}).not.toThrow("")
    expect(()=>{r.down(NewNote("C", 4), 1)}).toThrow("Note already down")
    expect(r.getNotes()).toEqual(new TimedNotes([]))
})

test("RecorderUpBeforeDown0", ()=>{
    let r = new Recorder();
    r.start(0)
    expect(()=>{r.up(NewNote("C", 4), 1)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(0, 1, NewNote("C", 4))]))
})

test("RecorderUpBeforeDown1", ()=>{
    let r = new Recorder();
    r.start(1)
    expect(()=>{r.up(NewNote("C", 4), 2)}).not.toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([new TimedNote(1, 2, NewNote("C", 4))]))
})

test("RecorderOutOfBounds", ()=>{
    let r = new Recorder();
    r.start(1)
    expect(()=>{r.down(NewNote("C", 4), 0)}).toThrow("")
    expect(()=>{r.up(NewNote("C", 4), 0)}).toThrow("")
    expect(r.getNotes()).toEqual(new TimedNotes([]))
})

test("FailedNewNote", ()=>{
    expect(()=>{new TimedNote(new Fraction("2/10"), new Fraction("1/10"), NewNote("d", 4))}).toThrow("start must be before end")
})

test("NotesErroringNew", ()=>{
    expect(()=>{new TimedNotes([new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("d", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).toThrow("Notes out of order: d4 starts at 0.1 and c4 starts at 0")
})

test("NotesNotErroringNew", ()=>{
    expect(()=>{new TimedNotes([new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), new TimedNote(new Fraction("1/10"), new Fraction("2/10"), NewNote("c", 4))])}).not.toThrow("Notes out of order")
    expect(()=>{new TimedNotes([new TimedNote(0, new Fraction("1/10"), NewNote("c", 4)), new TimedNote(new Fraction("0"), new Fraction("1/10"), NewNote("c", 4))])}).not.toThrow("Notes out of order")
})