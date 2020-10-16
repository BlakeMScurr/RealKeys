import Piano from './Piano.svelte';
import { NewNote, notesBetween, Line } from "../../../lib/music/theory/notes";
import { label } from "./piano"

export default {
  title: 'Piano',
};

const Template = ({...args }) => ({
  Component: Piano,
  props: {
    ...args,
  },
});

export const FromC = Template.bind({})
FromC.args = {
  keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
}

export const FromF = Template.bind({})
FromF.args = {
  keys: notesBetween(NewNote("F", 4), NewNote("F", 5)),
}

export const FromD = Template.bind({})
FromD.args = {
  keys: notesBetween(NewNote("D", 4), NewNote("E", 5)),
}

export const FromB = Template.bind({})
FromB.args = {
  keys: notesBetween(NewNote("B", 4), NewNote("E", 6)),
}

export const Used = Template.bind({})
let un = new Map()
un.set(NewNote("C", 4).string(), true)
un.set(NewNote("Eb", 4).string(), true)
un.set(NewNote("E", 4).string(), true)
un.set(NewNote("F#", 4).string(), true)
un.set(NewNote("C", 5).string(), true)
un.set(NewNote("A", 4).string(), true)
Used.args = {
  keys: notesBetween(NewNote("C", 4), NewNote("C", 5)),
  usedNotes: un,
}