import RollKey from './RollKey.svelte';

export default {
  title: 'RollKey',
};

export const White = () => ({
  Component: RollKey,
  props: {
      white: true,
      width: "20px",
      height: "100px",
  }
});

export const Black = () => ({
  Component: RollKey,
  props: {
      white: false,
      width: "20px",
      height: "100px",
  }
});

export const Border = () => ({
  Component: RollKey,
  props: {
      white: true,
      rightBorder: true,
      width: "20px",
      height: "100px",
  }
});
