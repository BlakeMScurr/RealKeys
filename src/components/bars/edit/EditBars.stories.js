import EditBars from "./EditBars.svelte";
export default {
    title: 'EditBars',
};

  export const Default = () => ({
    Component: EditBars,
    props: {
        position: 0,
        songLength: 10,
        bars: [{type: "s", width: 1}, {type: "e", width: 0}],
    },
});