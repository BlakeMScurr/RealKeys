import Bars from './Bars.svelte';

export default {
  title: 'Bars',
  excludeStories: /.*Data$/,
};

// Basic scores with repeats at the start and end
export const OneBar = () => ({
  Component: Bars,
  props: {
      bars: ["s", "e"]
  }
});

export const TwoBars = () => ({
  Component: Bars,
  props: {
      bars: ["s", "", "e"]
  }
});

export const FourBars = () => ({
  Component: Bars,
  props: {
      bars: ["s", "", "", "", "e"]
  }
});

export const EightBars = () => ({
  Component: Bars,
  props: {
      bars: ["s", "", "", "", "", "", "", "", "e"]
  }
});

// repeats in the middle
export const RepeatInTheMiddle = () => ({
    Component: Bars,
    props: {
        bars: ["", "s", "", "e", "", ""]
    }
});

// error conditions
// TODO: expect warnings

// Missing starts and ends
export const MissingStart = () => ({
    Component: Bars,
    props: {
        bars: ["", "e"],
    }
})

export const MissingEnd = () => ({
    Component: Bars,
    props: {
        bars: ["s", ""],
    }
})

export const MissingStartAndEnd = () => ({
    Component: Bars,
    props: {
        bars: ["", ""],
    }
})

// Multiple Starts and Ends
export const MultipleStarts = () => ({
    Component: Bars,
    props: {
        bars: ["s", "s", "", "e"],
    }
})

export const MultipleEnds = () => ({
    Component: Bars,
    props: {
        bars: ["s", "", "e", "e"],
    }
})

export const MultipleStartsAndEnds = () => ({
    Component: Bars,
    props: {
        bars: ["s", "s", "e", "e"],
    }
})

// start before end
export const StartBeforeEnd = () => ({
    Component: Bars,
    props: {
        bars: ["", "e", "s", ""],
    }
})

// combinations
export const StartBeforeEndMultiple = () => ({
    Component: Bars,
    props: {
        bars: ["s", "e", "s", "e"],
    }
})