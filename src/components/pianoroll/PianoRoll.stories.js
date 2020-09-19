import PianoRoll from './PianoRoll.svelte';
import { Bars, TimedNote, TimedNotes } from "./pianoroll";
import { NewNote } from "./music/theory/notes";

export default {
  title: 'PianoRoll',
};

export const Default = () => ({
  Component: PianoRoll,
  props: {
    bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
    notes: new TimedNotes([
      // Picardy
      new TimedNote(0, 1, NewNote("C", 4)),
      new TimedNote(0, 0.4, NewNote("F", 4)),
      new TimedNote(0, 1, NewNote("G", 4)),

      // Moving "Third"
      new TimedNote(0.4, 0.6, NewNote("D", 4)),
      new TimedNote(0.6, 0.8, NewNote("Eb", 4)),
      new TimedNote(0.8, 1, NewNote("E", 4)),
    ]),
  }
});


