import { instrument, Player, InstrumentName } from 'soundfont-player';
import { highestPianoNote, lowestPianoNote, Note } from '../music/theory/notes'
import { instrumentName } from './generalMidiMapping'

export class SoundFont {
    private internalInstrument: Player;
    private volume: number;
    private instrumentName: string;
    private ac: AudioContext;
    private playingNotes: Map<string, Player>;
    constructor(GeneralMidiInstrumentNumber: number, name: string, percusive:Boolean, onload: (succeeded: boolean) => void, notes?: Array<Note>) {
        this.volume = 1
        this.instrumentName = name
        this.ac = new AudioContext()
        this.playingNotes = new Map();

        let opts
        if (notes != undefined) {
            opts = { notes:  Array.from(new Set(notes.map((note)=>{return note.enharmonicEquivalent()}))) }
        }

        // GeneralMidiInstrumentNumber refers to https://en.wikipedia.org/wiki/General_MIDI#Program_change_events
        if (percusive) {
            let fontOpts = { soundfont: "FluidR3_GM" }
            instrument(this.ac, <InstrumentName>"percussion", { ...opts, ...fontOpts}).then((i)=>{
                this.internalInstrument = i
                onload(true)
            }).catch(() => {
                onload(false)
            })
        } else {
            instrument(this.ac, instrumentName(GeneralMidiInstrumentNumber), opts).then((i)=>{
                this.internalInstrument = i
                onload(true)
            }).catch(()=> {
                onload(true)
            })
        }
    }

    loaded():boolean {
        return this.internalInstrument !== undefined
    }

    getVolume():number {
        return this.volume
    }

    setVolume(volume: number) {
        console.log("setting volume in soundfont instrument to", volume)
        this.volume = volume
    }

    name():string {
        return this.instrumentName
    }

    play(note: Note, duration?: number) {
        if (this.loaded()) {
            if (this.highest().lowerThan(note) || note.lowerThan(this.lowest())) {
                console.warn("trying to play", note.string(), "which is out of the instrument's range", this.lowest().string(), "-", this.highest().string())
            } else {
                let opts = { gain: this.getVolume() }
                console.log("playing note with opts", opts)
                if (duration != undefined) {
                    opts["duration"] = duration / 1000 // duration is in milliseconds, but soundfont accepts seconds
                }
                let notePlayer = this.internalInstrument.play(note.string(), this.ac.currentTime, opts)
                if (notePlayer == undefined) {
                    throw new Error(`Couldn't play note ${note.string()} on the ${this.name()} track`)
                }
                this.playingNotes.set(note.string(), notePlayer)
            } 
        }
    }

    stop(note: Note) {
        if (this.loaded()) {
            if (this.playingNotes.has(note.string())) {
                this.playingNotes.get(note.string()).stop(this.ac.currentTime)
                this.playingNotes.delete(note.string())
            } else {
                console.warn("trying to stop note", note.string(), "that wasn't started")
            }
        }
    }

    // TODO: make this customisable
    highest():Note {
        return highestPianoNote
    }

    lowest():Note {
        return lowestPianoNote
    }
}