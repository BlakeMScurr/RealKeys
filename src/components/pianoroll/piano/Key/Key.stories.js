import _storybook_Key from './_storybook_Key.svelte';
import { AbstractNote } from "../../../../lib/music/theory/notes";
export default {
  title: 'Key',
};

// Kinda silly beacuse we can't see it in storybook
// TODO: fix
export const White = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      active: false,
  }
});

export const Black = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      active: false,
  }
});

export const WhiteClicked = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      active: true,
  }
});

export const BlackClicked = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      active: true,
  }
});

