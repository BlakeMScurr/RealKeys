import pitchDetector from "./pitchDetector.svelte";

export default {
    title: 'Pitch Detector',
};

const Template = ({...args }) => ({
    Component: pitchDetector,
  });
  
export const Default = Template.bind({});