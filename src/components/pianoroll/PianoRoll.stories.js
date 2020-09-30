import PianoRoll from "./PianoRoll.svelte"
import { TimedNote, TimedNotes } from "../../lib/music/timed/timed";
import { Bars}  from "./pianoroll";
import { NewNote } from "../../lib/music/theory/notes";

export default {
  title: 'PianoRoll',
  component: PianoRoll,
  argTypes: {
    recordMode: { control: 'boolean' },
  },
};

const Template = ({...args }) => ({
  Component: PianoRoll,
  props: {
    // TODO: make an issue on storybook for the unexpected token error when we pass bars and notes via the args
    bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
    pos: 0,
    ...args,
  },
});

export const Default = Template.bind({});
Default.args = {
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

export const Empty = Template.bind({});
