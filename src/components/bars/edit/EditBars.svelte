<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createUnevenBars, createEvenBars } from "./editBars.js"

    export let position = 0;
    export let songLength; // length of the song

    let bpm = 0;
    let tapTimes = [];
    let norm;

    let bars = [{type: "s", width: 1}, {type: "e", width: 0}]
    $: {
        if (!norm) {
            bars = createUnevenBars(tapTimes, songLength, position)
        } else {
            bars = createEvenBars(position, bpm, songLength)
        }
    }
</script>

<ZoomBars bind:position={position} bars={bars}></ZoomBars>

<div>
    <label>
        Normalise
        <input type="checkbox" bind:checked={norm}>
    </label>
</div>

<Tapper bind:bpm={bpm} bind:tapTimes={tapTimes}></Tapper>