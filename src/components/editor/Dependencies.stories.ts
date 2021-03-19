import Dependencies from "./Dependencies.svelte";

export default {
    title: 'Dependencies',
};

const Template = ({...args }) => ({
    Component: Dependencies,
    props: {
      ...args,
    },
  });

export const Default = Template.bind({});
Default.args = {
    curriculae: ["a", "b", "c", "d"]
}