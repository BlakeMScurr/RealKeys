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
    _storybook_duration: 10,
    _storybook_ready: false,
}
