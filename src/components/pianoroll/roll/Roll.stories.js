import Roll from './Roll.svelte';
import { notesBetween } from "../piano/piano";
import { Bars } from "../pianoroll";
import { NewNote } from "../music/theory/notes";



export default {
  title: 'Roll',
};

export const Default = () => ({
  Component: Roll,
  props: {
      notes: notesBetween(NewNote("C", 4), NewNote("C", 5)),
      height: "400",
      unit: "px",
      bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
  }
});

export const TwoOctaves = () => ({
  Component: Roll,
  props: {
      notes: notesBetween(NewNote("C", 4), NewNote("C", 6)),
      height: "400",
      unit: "px",
      bars: new Bars([0.2, 0.2, 0.2, 0.2, 0.2]),
  }
});


