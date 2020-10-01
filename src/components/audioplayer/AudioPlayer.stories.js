import { even } from "../bars/bars.ts";
import { NewMockPlayer, NewHowlAudioPlayer } from './audioplayer';
// import { firework } from './firework'
import AudioPlayer from './AudioPlayer.svelte';
import _storybook_AudioPlayer from './_storybook_AudioPlayer.svelte';

export default {
  title: 'AudioPlayer',
};

export const Default = () => ({
  Component: AudioPlayer,
  props: {
    AudioPlayerPromise: NewMockPlayer((5)),
  },
});

export const Loading = () => ({
  Component: AudioPlayer,
  props: {
    AudioPlayerPromise: new Promise(()=>{}),
  },
});

// export const RealPlayer = () => ({
//   Component: _storybook_AudioPlayer,
//   props: {
//     AudioPlayerPromise: NewHowlAudioPlayer(firework), // if necessary another test file like firework can be generated by printing `data` from after using this technique to play a local file https://github.com/goldfire/howler.js/issues/724#issuecomment-383418309
//     bars: even(["s", "e"]),
//   }
// })