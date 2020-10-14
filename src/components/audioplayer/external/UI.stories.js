import UI from "./UI.svelte";

export default {
    title: 'AudioPlayer UI',
  };

export const Default = () => ({
    Component: UI,
    props: {
        _storybook_position: 0.2,
        _storybook_duration: 10,
    }
});
