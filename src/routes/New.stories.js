import newLesson from './newLesson.svelte';

export default {
  title: 'newLesson',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: newLesson,
})