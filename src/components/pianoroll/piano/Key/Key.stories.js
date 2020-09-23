import Key from './Key.svelte';
import { AbstractNote } from "../../../../lib/music/theory/notes";
export default {
  title: 'Key',
};

// Kinda silly beacuse we can't see it in storybook
// TODO: fix
export const White = () => ({
  Component: Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      clicked: false,
  }
});

export const Black = () => ({
  Component: Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      clicked: false,
  }
});

export const WhiteClicked = () => ({
  Component: Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      clicked: true,
  }
});

export const BlackClicked = () => ({
  Component: Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      clicked: true,
  }
});

