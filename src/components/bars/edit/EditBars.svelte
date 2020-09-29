<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createUnevenBars, createEvenBars } from "./editBars.js"
    import { createEventDispatcher } from 'svelte';
    import { position } from "../../stores"

    export let songLength; // length of the song
    export let bars;

    const dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail);
    }

    let pos = 0;
    position.subscribe((val)=>{
        pos = val
    })

    let bpm = 0;
    let tapTimes = [];
    let norm;
    let moveAnchor = false
    let anchor = pos

    $: {
        if (moveAnchor) {
            anchor = pos
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

<ZoomBars bind:position={pos} bars={bars} on:seek={forward}></ZoomBars>

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
