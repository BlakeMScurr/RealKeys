<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createUnevenBars, createEvenBars } from "./editBars.js"
    import { createEventDispatcher } from 'svelte';

    export let position = 0;
    export let songLength; // length of the song
    export let bars;

    const dispatch = createEventDispatcher();
    function forward(event) {
        console.log("forwarding from editbars")
        dispatch(event.type, event.detail);
    }

    let bpm = 0;
    let tapTimes = [];
    let norm;
    let moveAnchor = false
    let anchor = position

    $: {
        if (moveAnchor) {
            anchor = position
        }
    }

    $: {
        if (!norm) {
            bars = createUnevenBars(tapTimes, songLength, anchor)
        } else {
            bars = createEvenBars(anchor, bpm, songLength)
        }
    }

    // TODO: allow sections with different tempos
</script>

<ZoomBars bind:position={position} bars={bars} on:seek={forward}></ZoomBars>

<div>
    <label>
        Normalise
        <input type="checkbox" bind:checked={norm}>
    </label>
    <label>
        Move Anchor
        <input type="checkbox" bind:checked={moveAnchor}>
    </label>
</div>

<Tapper bind:bpm={bpm} bind:tapTimes={tapTimes}></Tapper>
