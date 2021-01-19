import ReccomendedButton from "./ReccomendedButton.svelte";
import OptionButton from "./OptionButton.svelte";
import CTAButton from "./CTAButton.svelte";
import LockButton from "./LockButton.svelte";

export default {
    title: 'Buttons',
};

export const RecTryAgain = () => ({
    Component: ReccomendedButton,
    props: {
        text: "Try Again",
    }
});

export const RecNextLevel = () => ({
    Component: ReccomendedButton,
    props: {
        text: "Next Level",
    }
});

export const RecStart = () => ({
    Component: ReccomendedButton,
    props: {
        text: "Start",
    }
});

export const RecLearn = () => ({
    Component: ReccomendedButton,
    props: {
        text: "Learn",
    }
});

export const OptLearn = () => ({
    Component: OptionButton,
    props: {
        text: "Learn",
    }
});

export const OptPractice = () => ({
    Component: OptionButton,
    props: {
        text: "Practice",
    }
});

export const OptSelectLevel = () => ({
    Component: OptionButton,
    props: {
        text: "Select Level",
    }
});

export const CTA = () => ({
    Component: CTAButton,
    props: {
        text: "Get Started",
    }
});

export const Lock = () => ({
    Component: LockButton,
    props: {
        text: "Get Started",
    }
});
