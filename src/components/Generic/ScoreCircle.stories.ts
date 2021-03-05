import ScoreCircle from "./ScoreCircle.svelte";

export default {
    title: 'ScoreCircle',
};

const Template = ({...args }) => ({
    Component: ScoreCircle,
    props: {
      ...args,
    },
  });

export const Default = Template.bind({});
Default.args = {}

export const zero = Template.bind({});
zero.args = {
    score: 0,
}

export const fifty = Template.bind({});
fifty.args = {
    score: 0,
}

export const onehundred = Template.bind({});
onehundred.args = {
    score: 0,
}
  