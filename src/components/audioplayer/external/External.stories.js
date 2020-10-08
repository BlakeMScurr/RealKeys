import Spotify from "./Spotify.svelte";

export default {
    title: 'External AudioPlayer',
  };

export const Default = () => ({
    Component: Spotify,
    props: {
      track: "1ZMiCix7XSAbfAJlEZWMCp",
    },
});
