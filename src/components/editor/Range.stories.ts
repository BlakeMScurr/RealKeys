import { NewNote } from "../../lib/music/theory/notes";
import Range from "./Range.svelte";

export default {
    title: 'Range',
};

const Template = ({...args }) => ({
    Component: Range,
    props: {
      ...args,
    },
  });

export const Default = Template.bind({});
Default.args = {
    defaultRange: false,
    lowest: NewNote("C", 4),
    highest: NewNote("C", 5),
}