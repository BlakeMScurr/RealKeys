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
      state: "",
  }
});

export const Black = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      state: "",
  }
});

export const BlackLabeled = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      state: "",
      label: "u",
  }
});

export const WhiteLabeled = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      state: "",
      label: "j",
  }
});

export const WhiteClicked = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      state: "active",
  }
});

export const WhiteRight = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("c"),
      state: "right",
  }
});

export const BlackClicked = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      state: "active",
  }
});

export const BlackWrong = () => ({
  Component: _storybook_Key,
  props: {
      width: 20,
      height: 100,
      note: new AbstractNote("f#"),
      state: "wrong",
  }
});

