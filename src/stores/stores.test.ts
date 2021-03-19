// This file defines the core of the reactive part of the application

import { GameMaster, squasher } from "./stores"
import { get } from "../lib/util"
import { TimedNote, TimedNotes } from "../lib/music/timed/timed";
import { NewNote, Note } from "../lib/music/theory/notes";
import { MockInstrument } from "../lib/track/instrument";
import { noteState } from "./track";

// Normal user flows:
// - Seek back and forwards a little
// - Hit play and listen
// - Change tracks while listening
// - Try to play along
// - pause, seek, and play again
// - play, and seek
// - change tracks while paused
// - switch to wait mode, and seek

test("seek", ()=>{
    let gm = new GameMaster();
    expect(get(gm.duration)).toBe(100000)
    expect(get(gm.seek)).toBe(0)
    gm.seek.set(1)
    expect(get(gm.seek)).toBe(1)
    expect(get(gm.position)).toBe(1)
})

// TODO: abstract testing infrastructure as it's a little complex
test("basicNoteSubscription", (done) => {
    let gm = new GameMaster();
    gm.duration.set(1000) // one second song
    gm.tracks.newPlaybackTrack("1", new TimedNotes([
        new TimedNote(0, 0.5, NewNote("C", 4)),
    ]), new MockInstrument(), gm)
    let states: Array<string> = []
    gm.tracks.subscribeToNotesOfTracks(["1"], (notes) => {
        states.push(JSON.stringify([...notes]))
    })

    gm.play.play()
    setTimeout(() => {
        gm.play.pause()
        // TODO: expect proper thing
        expect(states).toEqual([
            "[]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softStart\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"strict\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softEnd\"]]",
            "[]",
            "[]",
        ])
        done()
    }, 1050);
})

test("twoNoteOneTrackSubscription", (done) => {
    let gm = new GameMaster();
    gm.duration.set(1000) // one second song
    gm.tracks.newPlaybackTrack("1", new TimedNotes([
        new TimedNote(0, 0.25, NewNote("C", 4)),
        new TimedNote(0.5, 0.75, NewNote("B", 4)),
    ]), new MockInstrument(), gm)


    let states: Array<string> = []
    gm.tracks.subscribeToNotesOfTracks(["1"], (notes) => {
        states.push(JSON.stringify([...notes]))
    })

    gm.play.play()
    setTimeout(() => {
        gm.play.pause()
        // TODO: expect proper thing
        expect(states).toEqual([
            "[]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softStart\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"strict\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softEnd\"]]",
            "[]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"softStart\"]]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"strict\"]]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"softEnd\"]]",
            "[]",
            "[]",
        ])
        done()
    }, 1050);
})

test("twoTrackNoteSubscription", (done) => {
    let gm = new GameMaster();
    gm.duration.set(1000) // one second song
    gm.tracks.newPlaybackTrack("1", new TimedNotes([
        new TimedNote(0, 0.25, NewNote("C", 4)),
    ]), new MockInstrument(), gm)

    gm.tracks.newPlaybackTrack("2", new TimedNotes([
        new TimedNote(0.5, 0.75, NewNote("B", 4)),
    ]), new MockInstrument(), gm)


    let states: Array<string> = []
    gm.tracks.subscribeToNotesOfTracks(["1", "2"], (notes) => {
        states.push(JSON.stringify([...notes]))
    })

    gm.play.play()
    setTimeout(() => {
        gm.play.pause()
        // TODO: expect proper thing
        expect(states).toEqual([
            "[]",
            "[]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softStart\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"strict\"]]",
            "[[{\"abstract\":{\"letter\":\"c\",\"accidental\":false},\"octave\":4},\"softEnd\"]]",
            "[]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"softStart\"]]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"strict\"]]",
            "[[{\"abstract\":{\"letter\":\"b\",\"accidental\":false},\"octave\":4},\"softEnd\"]]",
            "[]",
            "[]",
            "[]",
        ])
        done()
    }, 1050);
})

// TODO: handle cases where there is clashing
test("StateSquash", () => {
    let sq = new squasher();

    expect(sq.state()).toEqual(new Map<Note, noteState>())

    sq.updateState("chan1", new Map<Note, noteState>([[NewNote("C", 4), noteState.soft]]))
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>([[NewNote("C", 4), noteState.soft]])))
    
    sq.updateState("chan2", new Map<Note, noteState>([[NewNote("D", 4), noteState.soft]]))
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>([
        [NewNote("C", 4), noteState.soft],
        [NewNote("D", 4), noteState.soft],
    ])))

    sq.updateState("chan3", new Map<Note, noteState>([[NewNote("D", 4), noteState.soft]]))
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>([
        [NewNote("C", 4), noteState.soft],
        [NewNote("D", 4), noteState.soft],
    ])))

    sq.updateState("chan2", new Map<Note, noteState>())
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>([
        [NewNote("C", 4), noteState.soft],
        [NewNote("D", 4), noteState.soft],
    ])))

    sq.updateState("chan1", new Map<Note, noteState>())
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>([
        [NewNote("D", 4), noteState.soft],
    ])))

    sq.updateState("chan3", new Map<Note, noteState>())
    expect(sq.state()).toEqual(new Map<Note, noteState>(new Map<Note, noteState>()))

})