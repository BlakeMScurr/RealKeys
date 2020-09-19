import Roll from './Roll.svelte';
import { Bars, TimedNote, TimedNotes } from "../pianoroll";
import { NewNote, notesBetween } from "../music/theory/notes";

export default {
  title: 'Roll',
};

export const Default = () => ({
  Component: Roll,
  props: {
    keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
    height: 400,
    unit: "px",
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

export const TwoOctaves = () => ({
  Component: Roll,
  props: {
    keys: notesBetween(NewNote("C", 4), NewNote("C", 6)),
    height: 400,
    unit: "px",
    bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
    notes: new TimedNotes([
      // Root Position
      new TimedNote(0, 0.2, NewNote("C", 4)),
      new TimedNote(0, 0.2, NewNote("E", 4)),
      new TimedNote(0, 0.2, NewNote("G", 4)),

      // First Inversion
      new TimedNote(0.2, 0.4, NewNote("E", 4)),
      new TimedNote(0.2, 0.4, NewNote("G", 4)),
      new TimedNote(0.2, 0.4, NewNote("C", 5)),

      // Second Inversion
      new TimedNote(0.4, 0.6, NewNote("G", 4)),
      new TimedNote(0.4, 0.6, NewNote("C", 5)),
      new TimedNote(0.4, 0.6, NewNote("E", 5)),

      // Root Position up an Octave
      new TimedNote(0.6, 0.8, NewNote("C", 5)),
      new TimedNote(0.6, 0.8, NewNote("E", 5)),
      new TimedNote(0.6, 0.8, NewNote("G", 5)),
      
      // Final Note
      new TimedNote(0.8, 1, NewNote("C", 4)),
    ])
  }
});


