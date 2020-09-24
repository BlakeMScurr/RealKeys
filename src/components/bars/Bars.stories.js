import Bars from './Bars.svelte';
import { even } from "./bars.ts";

export default {
  title: 'Bars',
  excludeStories: /.*Data$/,
};

// Basic scores with repeats at the start and end
export const OneBar = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "e"]),
      position: 0,
  }
});

export const TwoBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "e"]),
      position: 0.5,
  }
});

export const FourBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "", "", "e"]),
      position: 0.125,
  }
});

export const EightBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "", "", "", "", "", "", "e"]),
      position: 0.375,
  }
});

// repeats in the middle
export const RepeatInTheMiddle = () => ({
    Component: Bars,
    props: {
        bars: even(["", "s", "", "e", "", ""]),
        position: 0.8,
    }
});

// Bar lengths
export const Uneven = () => ({
    Component: Bars,
    props: {
        bars: [
            { type: "s", length: 0.333 },
            { type: "", length: 0.667 },
            { type: "e", length: 0 }
        ],
        position: 1,
    }
})

// error state
// TODO: handle error so that it doesn't break chromatic
// export const ErrorState = () => ({
//     Component: Bars,
//     props: {
//         bars: even(["", "e"],),
//     }
// })

// decluttering
export const Dense = () => ({
    Component: Bars,
    props: {
        bars: even(["s"].concat(new Array(31).fill(""), ["e"]))
    }
})

// zoom
export const Zoom = () => ({
    Component: Bars,
    props: {
        bars: even(["s"].concat(new Array(31).fill(""), ["e"])),
        zoomStart: 0.25,
        zoomEnd: 0.75,
        position: 0.5,
    }
})

export const ZoomPositionOnBound = () => ({
    Component: Bars,
    props: {
        bars: even(["s"].concat(new Array(31).fill(""), ["e"])),
        zoomStart: 0.25,
        zoomEnd: 0.75,
        position: 0.25,
    }
})
export const ZoomPositionOutOfBounds = () => ({
    Component: Bars,
    props: {
        bars: even(["s"].concat(new Array(31).fill(""), ["e"])),
        zoomStart: 0.25,
        zoomEnd: 0.75,
        position: 0,
    }
})