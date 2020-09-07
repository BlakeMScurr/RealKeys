<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createBars } from "./editBars.js"

    export let position = 0;
    export let songLength; // length of the song

    let bpm = 0;
    let tapTimes = [];
    $: bars = createBars(tapTimes, songLength, position)
</script>

<ZoomBars bind:position={position} bars={bars}></ZoomBars>
<Tapper bind:bpm={bpm} bind:tapTimes={tapTimes}></Tapper>

bpm: {bpm}
tapTimes: {tapTimes}
songLength: {songLength}

