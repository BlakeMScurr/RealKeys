import UI from "./UI.svelte";

export default {
    title: 'AudioPlayer UI',
};

const Template = ({...args }) => ({
    Component: UI,
    props: {
      ...args,
    },
  });
  
export const Default = Template.bind({});
Default.args = {
    _storybook_position: 0.2,
    _storybook_duration: 10000,
    _storybook_ready: true,
}

export const NotReady = Template.bind({});
NotReady.args = {
    _storybook_position: 0.2,
    _storybook_duration: 10000,
    _storybook_ready: false,
}
