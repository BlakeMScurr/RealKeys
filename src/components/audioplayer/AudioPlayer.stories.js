import AudioPlayer from './AudioPlayer.svelte';
import { MockPlayer } from './audioplayer';

export default {
  title: 'AudioPlayer',
};

export const Default = () => ({
  Component: AudioPlayer,
  props: {
    audioPlayer: new MockPlayer(5),
    startRepeat: {control: 'number'},
  },
});