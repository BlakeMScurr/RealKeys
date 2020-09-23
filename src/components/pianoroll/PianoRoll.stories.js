import PianoRoll from './PianoRoll.svelte';
import _storybook_Tester from "./_storybook_Tester.svelte"
import { Bars, TimedNote, TimedNotes } from "./pianoroll";
import { NewNote } from "./music/theory/notes";

export default {
  title: 'PianoRoll',
  component: _storybook_Tester,
};

const Template = ({...args }) => ({
  Component: _storybook_Tester,
  props: {
    // TODO: make an issue on storybook for the unexpected token error when we pass bars and notes via the args
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
    pos: 0,
  },
});

export const Default = Template.bind({});

