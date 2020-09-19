import Piano from './Piano.svelte';
import { NewNote, notesBetween } from "../music/theory/notes";

export default {
  title: 'Piano',
};

export const FromC = () => ({
  Component: Piano,
  props: {
    keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
  }
});

export const FromF = () => ({
  Component: Piano,
  props: {
    keys: notesBetween(NewNote("F", 4), NewNote("F", 5)),
  }
});