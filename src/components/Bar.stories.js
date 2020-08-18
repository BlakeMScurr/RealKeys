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
    type: "startrepeat",
  },
});

export const EndRepeat = () => ({
  Component: Bar,
  props: {
    type: "endrepeat",
  },
});