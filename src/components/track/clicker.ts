import * as Tone from 'tone'
import { NewNote, Note } from '../../lib/music/theory/notes';
import { Synth } from "./instrument"


export const lowClick = NewNote("F", 5)
export const highClick = NewNote("C", 6)
export function newClicker(name: string):Synth {
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