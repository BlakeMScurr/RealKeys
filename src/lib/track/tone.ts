import * as Tone from 'tone'
import { highestPianoNote, lowestPianoNote, Note } from '../music/theory/notes';

export class toneInstrument {
    underlying: Tone.PolySynth;
    nameStr: string;

    constructor(name: string) {
        this.underlying = new Tone.PolySynth(Tone.Synth).toDestination();
        this.nameStr = name;
    }

    loaded():boolean {
        return true
    }
    getVolume():number {
        return 1
    }
    setVolume(volume: number) {}
    name():string {
        return this.nameStr
    }

    play(note: Note, duration: number, volume: number) {
        this.underlying.triggerAttack(note.string())
    }

    stop(note: Note) {
        this.underlying.triggerRelease([note.string()])
    }

    highest():Note {
        return highestPianoNote
    }
    lowest():Note {
        return lowestPianoNote
    }
}