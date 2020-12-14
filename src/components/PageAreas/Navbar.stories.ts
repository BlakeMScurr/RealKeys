import Navbar from "./Navbar.svelte";

export default {
    title: 'AudioPlayer Navbar',
};

const Template = ({...args }) => ({
    Component: Navbar,
    props: {
      ...args,
    },
  });
  
export const Default = Template.bind({});
Default.args = {}

export const WithResults = Template.bind({});
WithResults.args = {
  searchResults: new Array<{path: string, name: string}>(
    {path: "the first", name: "the first"},
    {path: "another one", name: "another one"},
    {path: "a thing right here", name: "a thing right here"},
    {path: "a thing right here g homie", name: "a thing right here g homie"},
  )
}