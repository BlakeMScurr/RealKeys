// This file defines the core of the reactive part of the application

import { GameMaster } from "./stores"
import { get } from "../lib/util"
import { TimedNote, TimedNotes } from "../lib/music/timed/timed";
import { NewNote, Note } from "../lib/music/theory/notes";
import { MockInstrument } from "../lib/track/instrument";

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

test("basicNoteSubscription", (done) => {
    let gm = new GameMaster();
    gm.duration.set(1000) // one second song
    gm.tracks.newPlaybackTrack("1", new TimedNotes([
        new TimedNote(0, 0.5, NewNote("C", 4)),
    ]), new MockInstrument(), gm)
    let states = []
    gm.tracks.subscribeToNotesOfTracks(["1"], (notes) => {
        console.log("top level subscribe with parameter", notes)
        states.push(JSON.stringify([...notes]))
    })

    gm.play.play()
    setTimeout(() => {
        gm.play.pause()
        // TODO: expect proper thing
        expect(states).toEqual([
            "[]",
            "[[\"c4\",\"soft\"]]",
            "[[\"c4\",\"strict\"]]",
            "[[\"c4\",\"soft\"]]",
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


    let states = []
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
            "[[\"c4\",\"soft\"]]",
            "[[\"c4\",\"strict\"]]",
            "[[\"c4\",\"soft\"]]",
            "[]",
            "[[\"b4\",\"soft\"]]",
            "[[\"b4\",\"strict\"]]",
            "[[\"b4\",\"soft\"]]",
            "[]",
            "[]",
            "[]",
        ])
        done()
    }, 1050);
})