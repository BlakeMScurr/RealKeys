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

// error conditions
// TODO: expect warnings

// Missing starts and ends
export const MissingStart = () => ({
    Component: Bars,
    props: {
        bars: even(["", "e"],),
    }
})

export const MissingEnd = () => ({
    Component: Bars,
    props: {
        bars: even(["s", ""],),
    }
})

export const MissingStartAndEnd = () => ({
    Component: Bars,
    props: {
        bars: even(["", ""],),
    }
})

// Multiple Starts and Ends
export const MultipleStarts = () => ({
    Component: Bars,
    props: {
        bars: even(["s", "s", "", "e"],),
    }
})

export const MultipleEnds = () => ({
    Component: Bars,
    props: {
        bars: even(["s", "", "e", "e"],),
    }
})

export const MultipleStartsAndEnds = () => ({
    Component: Bars,
    props: {
        bars: even(["s", "s", "e", "e"],),
    }
})

// start before end
export const StartBeforeEnd = () => ({
    Component: Bars,
    props: {
        bars: even(["", "e", "s", ""],),
    }
})

// combinations
export const StartBeforeEndMultiple = () => ({
    Component: Bars,
    props: {
        bars: even(["s", "e", "s", "e"],),
    }
})

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

// Bar length errors
export const lengthSumTooLow = () => ({
    Component: Bars,
    props: {
        bars: [
            { type: "s", length: 0.5 },
            { type: "e", length: 0.25 }
        ]
    }
})

export const lengthSumTooHigh = () => ({
    Component: Bars,
    props: {
        bars: [
            { type: "s", length: 0.75 },
            { type: "", length: 0.75 },
            { type: "e", length: 0 }
        ]
    }
})

export const lastBarLineNonZero = () => ({
    Component: Bars,
    props: {
        bars: [
            { type: "s", length: 0.5 },
            { type: "e", length: 0.5 }
        ]
    }
})

