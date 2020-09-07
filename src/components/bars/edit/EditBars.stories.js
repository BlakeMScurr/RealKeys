import EditBars from "./EditBars.svelte";
export default {
    title: 'EditBars',
};

  export const Default = () => ({
    Component: EditBars,
    props: {
        position: 0,
        songLength: 30,
    },
});