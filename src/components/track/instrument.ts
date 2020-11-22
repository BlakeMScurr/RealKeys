import { highestPianoNote, lowestPianoNote, Note } from '../../lib/music/theory/notes';
import * as Tone from 'tone'
import type { TimedNotes } from '../../lib/music/timed/timed';

export class InertTrack {
    notes: TimedNotes;
    instrument: VirtualInstrument;
    constructor(notes: TimedNotes, instrument: VirtualInstrument) {
        this.notes = notes
        this.instrument = instrument
    }
}

export function newPiano(name: string):VirtualInstrument{
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
    return new Synth(name, sampler, lowestPianoNote, highestPianoNote)
}

export interface VirtualInstrument {
    loaded():boolean
    getVolume():number
    setVolume(volume: number)
    name():string
    play(note: Note, duration: number)
    stop(note: Note)
    highest():Note
    lowest():Note
}

class Synth {
    private internal: any;
    private instrumentName: string;
    private volume: number;
    private _highest: Note;
    private _lowest: Note;
    constructor(name: string, internal, lowest: Note, highest: Note) {
        this.internal = internal;
        this.instrumentName = name;
        this.volume = 1;
        this.internal.volume.value = Math.log10(this.volume)
        this._highest = highest
        this._lowest = lowest
    }

    loaded():boolean {
        if (this.internal._buffers === undefined) {
            return true
        }
        const loaded = this.internal._buffers._loadingCount === 0
        if (!loaded) {
            console.log("waiting on " + this.internal._buffers._loadingCount + " sounds to load")
        }
        return loaded
    }

    getVolume():number {
        return this.volume
    }

    setVolume(volume: number) {
        this.volume = volume
        this.internal.volume.value = Math.log10(this.volume)
    }

    name():string {
        return this.instrumentName
    }

    play(note: Note, duration: number=undefined) { 
        if (note.lowerThan(this.lowest()) || this.highest().lowerThan(note)) {
            console.warn("note", note.string(), "not in range", this.lowest().string(), "to", this.highest().string())
        } else {
            if (this.loaded()) {
                this.internal.triggerAttack(note.string())
                if (duration !== undefined) {
                    setTimeout(()=>{
                        this.stop(note)
                    }, duration)
                }
            }
        }
    }

    stop(note: Note) {
        try {
            this.internal.triggerRelease(note.string())
        } catch (error) {
            console.warn("could not release note", error)
        }
    }

    highest():Note {
        return this._highest
    }

    lowest():Note {
        return this._lowest
    }
}