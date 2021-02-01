import type { Writable } from 'svelte/store';
import { TimedNotes } from '../lib/music/timed/timed';
import { arraysEqual, get } from '../lib/util';
import type { GameMaster } from './stores';

// TODO: make everything in this file a method off GameMaster

export function handleNotes(gm: GameMaster, stateSetter: Writable<Map<string, string>>, availableTracks: Map<string, TimedNotes>) {
    return function(event) {
        let nextNotes = nextWaitModeNote(gm, availableTracks)
        if (nextNotes.sameStart.length >= 1) {
            let currentlyPlaing = event.detail.sort()
            let shouldPlay = nextNotes.sameStart.map((note) => { return note.note.string() }).sort()

            if (arraysEqual(currentlyPlaing, shouldPlay)) {
                if (nextNotes.next) {
                    nextNotes.sameStart.forEach((note) => {
                        setTimeout(()=> {
                            let state = get(stateSetter)
                            state.delete(note.note.string())
                            stateSetter.set(state)
                        }, (note.end - get(gm.position)) * get(gm.duration))
                    })

                    // we have to set the deletion timeouts before seeking, as when there are two directly adjacent notes of the same pitch, there is
                    // a race condiion between the timeout deleting the previous one from the state map, and the seek listener which sets the next one.
                    // The seek listener depends directly on seek.setSlow, and it needs to happen second, so we run seek.setSlow second
                    // TODO: find a solution that can provide strict certainty about time.
                    gm.seek.setSlow(nextNotes.next.start)

                    let state = get(stateSetter)
                    shouldPlay.forEach((noteName) => {
                        state.set(noteName, "soft")
                    })
                    stateSetter.set(state)
                }
            }
        }
    }
}

export function nextWaitModeNote(gm: GameMaster, availableTracks: Map<string, TimedNotes>) {
    let nextNotes = activeTrack(availableTracks).notesFrom(get(gm.position), 1)
    let i = 0
    let sameStart = []
    while (i < nextNotes.length && nextNotes[i].start == nextNotes[0].start) {
        sameStart.push(nextNotes[i])
        i++
    }

    let next = undefined;
    if (i < nextNotes.length) {
        next = nextNotes[i]
    }

    return { sameStart: sameStart, next: next }
}

// TODO: simplify simplify simplify
// I don't think this is likely to be necessary if we have carefully curated MIDI files
function activeTrack(sn: Map<string, TimedNotes>):TimedNotes  {
    let t;
    Array.from(sn.values()).forEach((track)=>{
        if (track.notes.length !== 0) {
            t = track
        }
    })
    return t || new TimedNotes([])
}