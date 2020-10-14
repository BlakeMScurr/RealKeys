import Slider from './Slider.svelte';
export default {
  title: 'Slider',
};

export const Default = () => ({
  Component: Slider,
  props: {
      min: 0,
      max: 1,
      step: 0.01,
      val: 0,
  }
});