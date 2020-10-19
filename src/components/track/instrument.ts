import { Note } from '../../lib/music/theory/notes';
// import { Piano } from '@tonejs/piano'
import * as Tone from 'tone'


export function newPiano() {
    return new Synth(new Tone.PolySynth().toDestination())
}

class Synth {
    internal: any;
    constructor(internal) {
        this.internal = internal
    }

    play(note: Note) {
        this.internal.triggerAttack(note.string())
    }

    stop(note: Note) {
        this.internal.triggerRelease(note.string())
    }
}