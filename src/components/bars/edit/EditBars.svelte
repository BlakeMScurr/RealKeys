<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createUnevenBars, createEvenBars } from "./editBars.js"

    export let position = 0;
    export let songLength; // length of the song
    export let bars;

    let bpm = 0;
    let tapTimes = [];
    let norm;

    $: {
        if (!norm) {
            bars = createUnevenBars(tapTimes, songLength, position)
        } else {
            bars = createEvenBars(position, bpm, songLength)
        }
    }

    // TODO: allow multiple secionts with different tempos
</script>

<ZoomBars bind:position={position} bars={bars}></ZoomBars>

<div>
    <label>
        Normalise
        <input type="checkbox" bind:checked={norm}>
    </label>
</div>

<Tapper bind:bpm={bpm} bind:tapTimes={tapTimes}></Tapper>