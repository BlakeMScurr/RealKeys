import UI from "./UI.svelte";
import { GameMaster } from "../../stores/stores";

export default {
    title: 'AudioPlayer UI',
};

let gm = new GameMaster()
gm.seek.set(0.5)
gm.audioReady.ready()
const Template = ({...args }) => ({
    Component: UI,
    props: {
      ...args,
      gm: gm,
    },
  });
  
export const Default = Template.bind({});