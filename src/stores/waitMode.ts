import type { Readable, Writable } from 'svelte/store';
import { TimedNote, TimedNotes } from '../lib/music/timed/timed';
import type { Note } from '../lib/music/theory/notes';
import { arraysEqual, get } from '../lib/util';
import type { GameMaster } from './stores';

// TODO: make everything in this file a method off GameMaster

export function handleNotes(gm: GameMaster, stateSetter: Writable<Map<Note, string>>, activeTrack: TimedNotes) {
    return function(event) {
        let nextNotes = nextWaitModeNote(gm, activeTrack)
        if (nextNotes.sameStart.length >= 1) {
            let comp = (a: Note, b: Note):number => { return a.lowerThan(b) ? -1 : 1 }
            let currentlyPlaying:Array<Note> = event.detail.sort(comp)
            let shouldPlay = nextNotes.sameStart.map((note) => { return note.note }).sort(comp)

            if (arraysEqual(currentlyPlaying, shouldPlay) && !get(gm.play)) { // don't proceed if we're currently playing
                let dest = nextNotes.next ? nextNotes.next.start : 1
                nextNotes.sameStart.forEach((note) => {
                    setTimeout(()=> {
                        let state = get(stateSetter)
                        state.delete(note.note)
                        stateSetter.set(state)
                    }, (note.end - get(gm.position)) * get(<Readable<number>>gm.duration))
                })

                // we have to set the deletion timeouts before seeking, as when there are two directly adjacent notes of the same pitch, there is
                // a race condiion between the timeout deleting the previous one from the state map, and the seek listener which sets the next one.
                // The seek listener depends directly on seek.setSlow, and it needs to happen second, so we run seek.setSlow second
                // TODO: find a solution that can provide strict certainty about time.
                gm.seek.setSlow(dest)

                let state = get(stateSetter)
                shouldPlay.forEach((noteName) => {
                    state.set(noteName, "soft")
                })
                stateSetter.set(state)
            }
        }
    }
}

export function nextWaitModeNote(gm: GameMaster, activeTrack: TimedNotes) {
    let nextNotes = activeTrack.notesFrom(get(gm.position), 1)
    let i = 0
    let sameStart: Array<TimedNote> = []
    while (i < nextNotes.length && nextNotes[i].start == nextNotes[0].start) {
        sameStart.push(nextNotes[i])
        i++
    }

    let next: TimedNote;
    if (i < nextNotes.length) {
        next = nextNotes[i]
    }

    return { sameStart: sameStart, next: next }
}