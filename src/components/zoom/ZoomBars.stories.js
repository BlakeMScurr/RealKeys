import ZoomBars from './ZoomBars.svelte';
import { even } from "../bars/bars.js";

export default {
  title: 'ZoomBars',
  excludeStories: /.*Data$/,
};

export const Default = () => ({
    Component: ZoomBars,
    props: {
        bars: even(["s", "", "", "", "", "", "", "", "e"]),
    }
})