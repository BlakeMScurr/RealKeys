import { Note } from '../../lib/music/theory/notes';
import { NewNote } from '../../lib/music/theory/notes';
import * as Tone from 'tone'
import type { TimedNotes } from '../../lib/music/timed/timed';
import { SoundFont } from './soundfont';

const soundFontCache = "soundFontCache"

export function NewInstrument(GeneralMidiInstrumentNumber: number, name: string, percusive:Boolean):Promise<SoundFont> {
    if (percusive) {
        return new Promise((resolve, reject) => {
            console.log("making percussion")
            caches.open(soundFontCache).then(function(cache) {
                cache.add("https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/percussion-mp3.js").then(() => {
                    resolve(new SoundFont(GeneralMidiInstrumentNumber, name, percusive))
                })
            })
        })
    }
    return new Promise((resolve, reject) => { 
        console.log("making piano")
        resolve(newPiano())
    })
}

// Copied from soundfont-player used to create the appropriate caching URL
// TODO: put the nameToUrl in the index.d.ts file in soundfont-player and make a PR upstream
function nameToUrl (name: string, sf: string, format: string) {
    format = format === 'ogg' ? format : 'mp3'
    sf = sf === 'FluidR3_GM' ? sf : 'MusyngKite'
    return 'https://gleitz.github.io/midi-js-soundfonts/' + sf + '/' + name + '-' + format + '.js'
}

let myOnlyPiano:SoundFont
export function newPiano() { // this is a bit of a misnomer, as it really only gives us the same piano
    if (myOnlyPiano === undefined) {
        console.log("making piano for the first time")
        myOnlyPiano = new SoundFont(0, "piano", false)

    }
    console.log("returning myOnlyPiano", myOnlyPiano)
    return myOnlyPiano
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
          modulationFrequency: 0.2
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