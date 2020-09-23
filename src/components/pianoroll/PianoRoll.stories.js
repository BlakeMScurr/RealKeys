import PianoRoll from './PianoRoll.svelte';
import { Bars, TimedNote, TimedNotes } from "./pianoroll";
import { NewNote } from "./music/theory/notes";

export default {
  title: 'PianoRoll',
  component: PianoRoll,
  argTypes: {
    position: { 
      control: {type: 'range', min: 0, max: 1, step: 0.001},
    },
  },
};

const Template = ({...args }) => ({
  Component: PianoRoll,
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
    ...args,
  },
  
});

export const Default = Template.bind({});
Default.args = {
  position: 0,
}

