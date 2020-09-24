import ZoomBars from './ZoomBars.svelte';
import { even } from "../bars.ts";

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
export const Big = () => ({
    Component: ZoomBars,
    props: {
        bars: even(["s", ...new Array(100).fill(""),"e"]),
    }
})