import AudioPlayer from './AudioPlayer.svelte';
import { even } from "../bars/bars.ts"

export default {
  title: 'AudioPlayer',
};

export const Default = () => ({
  Component: AudioPlayer,
  props: {
    Bars: even(["s", "", "", "", "", "", "e"]),
  },
});

