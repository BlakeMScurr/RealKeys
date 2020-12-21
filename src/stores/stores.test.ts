// This file defines the core of the reactive part of the application

import { GameMaster } from "./stores"
import { get } from "../lib/util"

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
    expect(get(gm.songDuration)).toBe(100000)
    expect(get(gm.seek)).toBe(0)
    gm.seek.set(1)
    expect(get(gm.seek)).toBe(10)
})