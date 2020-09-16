import NewLesson from './NewLesson.svelte';
import { MockFetcher } from '../../utils/util.js'

export default {
  title: 'NewLesson',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: NewLesson,
    props: {
        fetcher: new MockFetcher([
            {
                method: "POST",
                url: "getYTAsset/title/69420",
                result: {
                    title: "All Star but it's a Bach chorale following the conventions of the Common Practice Period",
                }
            }
        ]),
        youtubeID: "69420",
    }
})