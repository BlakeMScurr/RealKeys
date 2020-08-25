import Bars from './Bars.svelte';
import { even } from "./bars.js";

export default {
  title: 'Bars',
  excludeStories: /.*Data$/,
};

// Basic scores with repeats at the start and end
export const OneBar = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "e"]),
  }
});

export const TwoBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "e"]),
  }
});

export const FourBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "", "", "e"]),
  }
});

export const EightBars = () => ({
  Component: Bars,
  props: {
      bars: even(["s", "", "", "", "", "", "", "", "e"]),
  }
});

// repeats in the middle
export const RepeatInTheMiddle = () => ({
    Component: Bars,
    props: {
        bars: even(["", "s", "", "e", "", ""]),
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
    }
})

// error state
export const ErrorState = () => ({
    Component: Bars,
    props: {
        bars: even(["", "e"],),
    }
})

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
    }
})