import { highestPianoNote, lowestPianoNote, Note } from '../music/theory/notes';
import type { TimedNotes } from '../music/timed/timed';
import { toneInstrument } from './tone';

export interface Player {
    Seek(time: number);
    CurrentTime():number;
    Pause();
    Play();
    Duration():number;
    Volume(volume: number);
}

export function NewInstrument(GeneralMidiInstrumentNumber: number, name: string, percusive:Boolean, onload: (succeeded: boolean) => void, notes?: Array<Note>):VirtualInstrument {
    onload(true)
    return new toneInstrument(name)
}

// TODO: create new pianos from a pool of pianos ready that last a session to avoid lag every time we open a new game
export function newPiano(name: string, onload: (succeeded: boolean) => void){
    return NewInstrument(0, name, false, onload)
}

export class InertTrack {
    notes: TimedNotes;
    instrument: VirtualInstrument;
    constructor(notes: TimedNotes, instrument: VirtualInstrument) {
        this.notes = notes
        this.instrument = instrument
    }
}

export interface VirtualInstrument {
    loaded():boolean
    getVolume():number
    setVolume(volume: number)
    name():string
    play(note: Note, duration: number, volume: number)
    stop(note: Note)
    highest():Note
    lowest():Note
}

// TODO: delete any use soundfont instruments

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