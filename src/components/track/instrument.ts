import type { Note } from '../../lib/music/theory/notes';
import * as Tone from 'tone'
import type { instrument } from '../../stores/instruments';


export function newPiano() {
    const sampler = new Tone.Sampler({
        urls: {
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            "A6": "A6.mp3",
            "C2": "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            "A2": "A2.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    return new Synth(sampler)
}

export class Synth {
    internal: any;
    constructor(internal) {
        this.internal = internal
    }

    loaded() {
        if (this.internal._buffers === undefined) {
            return true
        }
        const loaded = this.internal._buffers._loadingCount === 0
        if (!loaded) {
            console.log("waiting on " + this.internal._buffers._loadingCount + " sounds to load")
        }
        return loaded
    }

    play(note: Note, volume: number) {
        if (this.loaded()) {
            this.internal.volume.value = Math.log10(volume)
            this.internal.triggerAttack(note.string())
        }
    }
    
    stop(note: Note, volume: number) {
        if (this.loaded()) {
            this.internal.volume.value = Math.log10(volume)
            this.internal.triggerRelease(note.string())
        }
    }

    genericise(name: string):instrument {
        return new wrapper(this, name)
    }
}

class wrapper {
    internal: Synth;
    volume: number;
    instrumentName: string;
    constructor(internal: Synth, name: string) {
        this.internal = internal
        this.volume = 1;
        this.instrumentName = name
    }

    getVolume() {
        return this.volume
    }

    setVolume(volume: number) {
        this.volume = volume
    }

    name():string {
        return this.instrumentName
    }

    play(note: Note, duration: number) {
        this.internal.play(note, this.volume)
        setTimeout(()=>{
            this.internal.stop(note, this.volume)
        }, duration)
    }
}