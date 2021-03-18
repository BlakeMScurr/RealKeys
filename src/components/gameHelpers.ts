import { newPiano } from "../lib/track/instrument";
import { Colourer } from "../components/colours";
import { getMIDI } from "../lib/midi";
import type { TimedNotes, TimedNote } from "../lib/music/timed/timed";
import { NewNote, Note } from "../lib/music/theory/notes";
import { GameMaster } from "../stores/stores";
import { scorer, timedScoreKeeper } from "../lib/gameplay/score/score";
import { OneTo100 } from "../lib/util";
import { hand, task } from "../lib/gameplay/curriculum/task";
import { getProgress } from "../lib/storage";
import { modeName } from "../lib/gameplay/mode/mode";
import type { noteState } from "../stores/track";

export function relevantTrack(tracks: Map<string, TimedNotes>, t: task):string[] {
    // assumes we have exactly 2 tracks, the first being the left hand, and the second being the right
    let arr = Array.from(tracks.keys())
    switch (t.getHand()) {
        case hand.Right:
            return [arr[0]]
        case hand.Left:
            return [arr[1]]
        case hand.Both:
            return arr
    }
}

// TODO: get rid of this, it's gross
// TODO: make sure that we make the left hand coloured red when we're learning the left hand
export function rellietracks(currentTask: task, tracks: Map<string, TimedNotes>):Map<string, TimedNotes> {
    return new Map<string, TimedNotes>(relevantTrack(tracks, currentTask).map((track) => { return [track, tracks.get(track)] as [string, TimedNotes]}))
}

export function getUsedNotes(currentTask: task, tracks: Map<string, TimedNotes>):Map<string, boolean> {
    let notes = new Map<string, boolean>();
    rellietracks(currentTask, tracks).forEach((tn) => {
        tn.untime().forEach(n => {
            notes.set(n.string(), true)
        });
    });
    return notes
}

export function mergeTracks(relevant: Array<string>, all: Map<string, TimedNotes>):TimedNotes {
    if (relevant.length === 0) {
        throw new Error("There must be at least one active track")
    } else if (relevant.length === 1) {
        return all.get(relevant[0])
    } else if (relevant.length === 2) {
        let left = all.get(relevant[0]) // TODO: see if left and right apply correctly
        let right = all.get(relevant[1])

        // TODO: avoid side effects by deep copying
        left.notes.push(...right.notes)

        left.notes.sort((a: TimedNote, b: TimedNote)=>{
            return a.start - b.start
        })
        return left
    }
    throw new Error("Couldn't merge tracks")
}

// TODO: tidy up this class, as it's really the core of how a given game works!
export class gameDefinition {
    highest: Note;
    lowest: Note;
    tracks: Map<any, any>; // TODO: figure out proper types
    duration: number
    colourer: Colourer;
    cleanup: () => void;
    onNext: () => void;
    gm: GameMaster;
    scorer: scorer;
    handlePlayingNotes: (event: any) => void;
    instrumentsLoaded: Promise<boolean>;
}

export function getGameDef(courseName: string, currentTask: task, setPosition: (p: number)=>void, setNotes: (notes: Map<Note, noteState>) => void, onComplete: (scorer)=>void):Promise<gameDefinition> {
    // TODO: get the midi from current session, and load it in lesson.svelte too
    return getMIDI("api/midi?path=" + courseName + "/" + currentTask.getLessonURL() + ".mid", currentTask.getStartBar(), currentTask.getEndBar()).then((midi)=>{
        // TODO: move all references to mode static mode methods
        let gd = new gameDefinition()
        gd.highest = midi.highest
        gd.lowest = midi.lowest
        gd.tracks = midi.tracks
        gd.duration = midi.duration
        gd.colourer = new Colourer(gd.tracks.size)
        gd.gm = new GameMaster()
        gd.gm.duration.set(gd.duration)

        gd.cleanup = gd.gm.position.subscribe((pos: number)=>{
            setPosition(pos)
            if (pos >= 1) { // TODO: wait until the last note of the track is done instead
                onComplete(gd.scorer)
            }
        })

        let rt = relevantTrack(gd.tracks, currentTask)
        let activeTrack = mergeTracks(rt, gd.tracks)

        let trackInstrumentsLoaded = 0
        gd.instrumentsLoaded = new Promise<boolean>((resolve)=> {
            gd.tracks.forEach((notes, name) => {
                let trackPiano = newPiano(name, ()=>{
                    trackInstrumentsLoaded++
                    if (trackInstrumentsLoaded === gd.tracks.size) {
                        resolve(true)
                    }
                })
                if (rt.includes(name) && currentTask.getMode().modeName() !== modeName.play) {
                    trackPiano.setVolume(0)
                }
                gd.gm.tracks.newPlaybackTrack(name, notes, trackPiano, gd.gm)
            })
        })

        let mode = currentTask.getMode()
        gd.scorer = mode.scorer(activeTrack, gd.gm.position)
        gd.handlePlayingNotes = mode.handleNotes(gd.gm, activeTrack)
        gd.onNext = mode.setup(gd.gm, activeTrack, rt, setNotes)

        return gd
    }).catch((e)=>{
        throw new Error(e)
    })
}

export function defaultGame():gameDefinition {
    let gd = new gameDefinition()
    gd.tracks = new Map<string, TimedNotes>();
    gd.colourer = new Colourer(3)
    gd.duration = 10000
    gd.scorer = new timedScoreKeeper(new GameMaster().position)
    gd.lowest = NewNote("C", 4)
    gd.highest = NewNote("C", 5)
    gd.handlePlayingNotes = (e: Event) => {}
    gd.onNext = () => {}
    gd.cleanup = () => {}
    return gd
}