<script>
    import ZoomBars from "../zoom/ZoomBars.svelte"
    import Tapper from "../tapper/Tapper.svelte"
    import { createUnevenBars, createEvenBars } from "./editBars.js"
    import { createEventDispatcher } from 'svelte';
    import { position, songDuration } from "../../../stores/stores"

    export let bars;
    
    let songLength;
    songDuration.subscribe((val)=>{
        songLength = val
    })

    const dispatch = createEventDispatcher();

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
        dispatch("newBars", bars)
    }

    // TODO: allow sections with different tempos
</script>

<ZoomBars bars={bars}></ZoomBars>

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
