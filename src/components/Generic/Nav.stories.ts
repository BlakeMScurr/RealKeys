import Nav from "./Nav.svelte";

export default {
    title: 'Nav',
};

const Template = ({...args }) => ({
    Component: Nav,
    props: {
      ...args,
    },
  });
  
export const Default = Template.bind({});
Default.args = {}