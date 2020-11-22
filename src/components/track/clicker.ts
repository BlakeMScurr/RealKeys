import * as Tone from 'tone'
import type { Instrument } from 'tone/build/esm/instrument/Instrument';
import { NewNote, Note } from '../../lib/music/theory/notes';
import { VirtualInstrument } from "./instrument"


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