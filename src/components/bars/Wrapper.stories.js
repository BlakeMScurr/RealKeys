import Wrapper from './Wrapper.svelte';

export default {
  title: 'Wrapper',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: Wrapper,
    props: {
        position: 0,
        songLength: 10,
        bars: [{type: "s", width: 1}, {type: "e", width: 0}],
    }
})