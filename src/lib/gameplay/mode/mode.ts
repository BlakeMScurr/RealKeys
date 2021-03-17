import { Readable, writable } from "svelte/store"
import type { GameMaster } from "../../../stores/stores"
import { noteState } from "../../../stores/track"
import { handleNotes, nextWaitModeNote } from "../../../stores/waitMode"
import type { Note } from "../../music/theory/notes"
import type { TimedNotes } from "../../music/timed/timed"
import { get } from "../../util"
import { scorer, staticScoreKeeper, timedScoreKeeper, untimedScoreKeeper } from "../score/score"

export interface playbackMode {
    modeName():modeName
    getSpeed():number
    toString():string // for serialisation, particularly in URLs
    description():string

    // static style methods that define the mode's operation
    scorer(position: Readable<number>):scorer
    handleNotes(gm: GameMaster, tn: TimedNotes):(event: any)=>void
    setup(gm: GameMaster, activeTrack: TimedNotes, rt: string[], setNotes: (notes: Map<Note, noteState>)=>void):()=>void // sets up the game and returns a function to be run when the user starts the game
}

export enum modeName {
    atSpeed = "atSpeed",
    wait = "wait",
    play = "play",
}

export function makeMode(mode: string):playbackMode {
    if (mode && mode.includes(modeName.atSpeed)) {
        return new atSpeedMode(parseInt(mode.replace(modeName.atSpeed, "")))
    }
    if (typeof modeName[mode] === "undefined") throw new Error(`unknown mode type ${mode}`)
    return modeFactory(<modeName>mode)
}

export function modeFactory(name: modeName, speed?: number):playbackMode {
    switch(name) {
        case modeName.atSpeed:
            return new atSpeedMode(speed)
        case modeName.wait:
            return new waitMode()
        case modeName.play:
            return new playMode()
    }
}

// TODO: can I made these methods on playback mode without redundantly adding it to every single class?
// TODO: can I overload the >= operator to call this function?
export function modeEqualOrHarder(a: playbackMode, b: playbackMode) {
    return (a.modeName() === b.modeName() && a.getSpeed() >= b.getSpeed()) || (a.modeName() === modeName.atSpeed && b.modeName() === modeName.wait)
}

export function equalModes(m: playbackMode, n: playbackMode): boolean {
    return  m.modeName() === n.modeName() && m.getSpeed() === n.getSpeed()
}

class atSpeedMode {
    private speed: number;
    constructor(speed?: number) {
        if (!speed) speed = 100
        if (speed <= 0) throw new Error(`Speeds cannot be less than or equal to zero, got ${speed}`) // This one is logically impossible - it would result in going backwards
        if (speed > 200) throw new Error(`Speeds should not be played at greater than twice the song's expected speed, got ${speed}`) // This is a sanity check, as (I believe) there's no reasonable reason to go faster than this
        this.speed = speed
    }

    modeName():modeName { return modeName.atSpeed }
    getSpeed():number { return this.speed }
    toString():string { return "atSpeed" + this.getSpeed() }
    description():string { return `At ${this.getSpeed()}% speed` }
    scorer(position: Readable<number>):scorer { return new timedScoreKeeper(position) }
    handleNotes(gm: GameMaster, tm: TimedNotes):(event: any)=>void { return ()=>{} }
    setup(gm: GameMaster, activeTrack: TimedNotes, rt: string[], setNotes: (notes: Map<Note, noteState>)=>void):()=>void {
        gm.seek.set(-2000/get(<Readable<number>>gm.duration)) // give space before the first note
        gm.speed.set(this.getSpeed()/100)
        gm.tracks.subscribeToNotesOfTracks(rt, (notes) => {
            setNotes(notes)
        })
        return () => { gm.play.play() }
    }
}

class waitMode {
    modeName():modeName { return modeName.wait }
    getSpeed():number { return 0 }
    toString():string { return "wait" }
    description():string { return "At your own pace" }
    scorer():scorer { return new untimedScoreKeeper() }
    handleNotes(gm: GameMaster, tn: TimedNotes):(event: any)=>void { return handleNotes(gm, tn)}
    setup(gm: GameMaster, activeTrack: TimedNotes, rt: string[], setNotes: (notes: Map<Note, noteState>)=>void):()=>void {
        gm.seek.set(0) // TODO: go to the first note
        gm.waitMode.set(true)
        gm.tracks.enable(rt)

        return () => {
            //subscribe to the notes needed to progress
            let stateSetter = writable(new Map<Note, noteState>());
            gm.seek.subscribe(() => {
                let state = new Map<Note, noteState>()
                let nextState = nextWaitModeNote(gm, activeTrack)
                nextState.sameStart.forEach(note => {
                    state.set(note.note, noteState.expecting)
                })
                nextState.heldNotes.forEach((_, note) => {
                    state.set(note, noteState.soft)
                })
                stateSetter.set(state)
            })

            stateSetter.subscribe((notes: Map<Note, noteState>) => {
                setNotes(notes)
            })
        }
    }
}

class playMode {
    modeName():modeName { return modeName.play }
    getSpeed():number { return 0 }
    toString():string { return "play" }
    description():string { return "Just listen" }
    scorer():scorer { return new staticScoreKeeper() } // TODO: make a trivial scorer
    handleNotes(gm: GameMaster, tm: TimedNotes):(event: any)=>void { return ()=>{}}
    setup(gm: GameMaster, activeTrack: TimedNotes, rt: string[], setNotes: (notes: Map<Note, noteState>)=>void):()=>void { 
        return () => { gm.play.play() }
    }
}