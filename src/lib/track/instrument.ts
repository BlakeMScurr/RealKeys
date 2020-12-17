import { highestPianoNote, lowestPianoNote, Note } from '../music/theory/notes';
import { NewNote } from '../music/theory/notes';
import * as Tone from 'tone'
import type { TimedNotes } from '../music/timed/timed';
import { SoundFont } from './soundfont';

export interface Player {
    Seek(time: number);
    CurrentTime():number;
    Pause();
    Play();
    Duration():number;
    Volume(volume: number);
}

export function NewInstrument(GeneralMidiInstrumentNumber: number, name: string, percusive:Boolean, notes?: Array<Note>):SoundFont {
    return new SoundFont(GeneralMidiInstrumentNumber, name, percusive, notes)
}

export function newPiano(name: string){
    return NewInstrument(0, name, false)
}

export class InertTrack {
    notes: TimedNotes;
    instrument: Promise<VirtualInstrument>;
    constructor(notes: TimedNotes, instrument: Promise<VirtualInstrument>) {
        this.notes = notes
        this.instrument = instrument
    }
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

export class Synth {
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

export const lowClick = NewNote("F", 5)
export const highClick = NewNote("C", 6)
export function newClicker(name: string):VirtualInstrument {
    const sampler = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0,
          decay: 0.1,
          sustain: 0,
          release: 0.1,
        }
      }).toDestination();
    return new Synth(name, sampler, lowClick, highClick)
}

export class MockInstrument {
    loaded():boolean { return true }
    getVolume():number { return 1 }
    setVolume(volume: number) {}
    name():string { return "mock instrument" }
    play(note: Note, duration: number=undefined) {}
    stop(note: Note) {}
    highest():Note { return highestPianoNote }
    lowest():Note { return lowestPianoNote }
}