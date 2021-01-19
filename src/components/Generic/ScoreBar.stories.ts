import ScoreBar from "./ScoreBar.svelte";

export default {
    title: 'ScoreBar',
};

const Template = ({...args }) => ({
    Component: ScoreBar,
    props: {
      ...args,
    },
  });

export const Default = Template.bind({});
Default.args = {}

export const CompleteSmall = Template.bind({});
CompleteSmall.args = {
    value: 100,
}
  

export const CompleteMedium = Template.bind({});
CompleteMedium.args = {
    value: 100,
    size: "medium",
}

export const CompleteLarge = Template.bind({});
CompleteLarge.args = {
    value: 100,
    size: "large",
}

export const Medium25Show = Template.bind({});
Medium25Show.args = {
    value: 25,
    size: "medium",
    showValue: true,
}

export const Large75Show = Template.bind({});
Large75Show.args = {
    value: 75,
    size: "large",
    showValue: true,
}
export const CompleteLargeShow = Template.bind({});
Large75Show.args = {
    value: 100,
    size: "large",
    showValue: true,
}