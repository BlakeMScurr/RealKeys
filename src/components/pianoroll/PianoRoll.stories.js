import PianoRoll from "./PianoRoll.svelte"
import { TimedNote, TimedNotes } from "../../lib/music/timed/timed";
import { Bars}  from "./pianoroll";
import { NewNote } from "../../lib/music/theory/notes";
import { songDuration, seek } from "../../stores/stores"
import { newPiano } from '../track/instrument'

export default {
  title: 'PianoRoll',
  component: PianoRoll,
  argTypes: {
    recordMode: { control: 'boolean' },
  },
};

// TODO: fix these, which broke when we updated to storybook 6.1.1

songDuration.set(2 * 1000) // set to 2 seconds length becaue that's the width of the zoom window, so we can see the whole song in the component without scrolling
seek.set(0.4) // show the whole thing in the display by moving 2/5 of the way through the song, as in the default piano roll we show the last 0.8 seconds to show how you did
// export const Default = () => ({
//   Component: PianoRoll,
//   props: {
//     notes: new TimedNotes([
//       // Picardy
//       new TimedNote(0, 1, NewNote("C", 4)),
//       new TimedNote(0, 0.4, NewNote("F", 4)),
//       new TimedNote(0, 1, NewNote("G", 4)),
  
//       // Moving "Third"
//       new TimedNote(0.4, 0.6, NewNote("D", 4)),
//       new TimedNote(0.6, 0.8, NewNote("Eb", 4)),
//       new TimedNote(0.8, 1, NewNote("E", 4)),
//     ]),
//     bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
//     pos: 0,
//     instrument: newPiano("Test Piano"),
//   },
// });

// export const Empty = Template.bind({});
