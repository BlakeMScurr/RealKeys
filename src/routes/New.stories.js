import newLesson from './newLesson.svelte';
import { MockFetcher } from '../lib/util.js'

export default {
  title: 'newLesson',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: newLesson,
})