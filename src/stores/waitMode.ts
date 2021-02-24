import type { Readable, Writable } from 'svelte/store';
import type { TimedNote, TimedNotes } from '../lib/music/timed/timed';
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

            // Allow one to hold over notes that from the previous section
            for (let i = currentlyPlaying.length - 1; i >= 0; i--) {
                if (nextNotes.heldNotes.has(currentlyPlaying[i])) {
                    currentlyPlaying.splice(i, 1)
                }
            }

            if (arraysEqual(currentlyPlaying, shouldPlay) && !get(gm.play)) {
                gm.seek.setSlow(nextNotes.next ? nextNotes.next.start : 1)
            }
        }
    }
}

export function nextWaitModeNote(gm: GameMaster, activeTrack: TimedNotes) {
    let pos = get(gm.position)
    // find all the notes that start at a give position
    let nextNotes = activeTrack.notesFrom(pos, 1)
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

    // find all the notes that are still being played at a given position
    let heldNotes = new Map<Note, boolean>()
    activeTrack.notesFrom(0, pos).forEach((note) => {
        if (note.start < pos && note.end > pos) {
            heldNotes.set(note.note, true)
        }
    })

    return { sameStart: sameStart, next: next, heldNotes: heldNotes }
}