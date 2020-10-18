import Spotify from "./Spotify.svelte";

export default {
    title: 'External AudioPlayer',
  };

export const Default = () => ({
    Component: Spotify,
    props: {
      track: "7xGfFoTpQ2E7fRF5lN10tr",
    },
});
