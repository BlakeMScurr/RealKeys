import ZoomArea from './ZoomArea.svelte';

export default {
  title: 'ZoomArea',
  excludeStories: /.*Data$/,
};

export const FullWidth = () => ({
    Component: ZoomArea,
    props: {
        start: 0,
        end: 1,
    }
})

export const HalfWidth = () => ({
    Component: ZoomArea,
    props: {
        start: 0,
        end: 0.5
    }
})

export const ThirdWidth = () => ({
    Component: ZoomArea,
    props: {
        start: 0,
        end: 1/3
    }
})

export const MiddleThird = () => ({
    Component: ZoomArea,
    props: {
        start: 1/3,
        end: 2/3
    }
})

export const ZeroWidth = () => ({
    Component: ZoomArea,
    props: {
        start: 0.5,
        end: 0.5
    }
})

export const NegativeWidth = () => ({
    Component: ZoomArea,
    props: {
        start: 1,
        end: 0
    }
})