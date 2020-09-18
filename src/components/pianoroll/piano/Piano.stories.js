import Piano from './Piano.svelte';
import { NewNote } from "../music/theory/notes";

export default {
  title: 'Piano',
};

export const FromC = () => ({
  Component: Piano,
  props: {
    lowest: NewNote("C", 4),
    highest: NewNote("C", 5),
  }
});

export const FromF = () => ({
  Component: Piano,
  props: {
    lowest: NewNote("F", 4),
    highest: NewNote("F", 5),
  }
});