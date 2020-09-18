import RollBar from './RollBar.svelte';
import { notesBetween } from "../piano/piano";
import { NewNote } from "../music/theory/notes";



export default {
  title: 'RollBar',
};

export const Default = () => ({
  Component: RollBar,
  props: {
      notes: notesBetween(NewNote("C", 4), NewNote("C", 5)),
      height: "100px",
  }
});

export const TwoOctaves = () => ({
  Component: RollBar,
  props: {
      notes: notesBetween(NewNote("C", 4), NewNote("C", 6)),
      height: "100px",
  }
});


