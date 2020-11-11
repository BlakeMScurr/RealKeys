import * as Tone from 'tone'
import { Synth } from "./instrument"

export function newClicker(name: string) {
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
    return new Synth(name, sampler)
}