import Seeker from './Seeker.svelte';

export default {
  title: 'Seeker',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: Seeker,
})