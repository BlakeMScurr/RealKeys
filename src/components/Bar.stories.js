import Bar from './Bar.svelte';
export default {
  title: 'Bar',
};

export const Default = () => ({
  Component: Bar,
  props: {
    type: "",
  },
});

export const StartRepeat = () => ({
  Component: Bar,
  props: {
    type: "s",
  },
});

export const EndRepeat = () => ({
  Component: Bar,
  props: {
    type: "e",
  },
});