<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import { niceBlue } from "../../../colours";
    
    export let active:Boolean;
    export let note:Note;
    export let label: String = "";

    const dispatch = createEventDispatcher()
    $: {
        dispatch(active ? "noteOn": "noteOff", note)
    }
</script>

<style>
      div {
        background-color: var(--color);
        /* TODO: why is there an overflow in the piano roll at higher key counts but not lower ones (see piano roll stories) */
        width: calc(100% - 2px);
        height: 100%;
        border: 1px solid grey;
        pointer-events:auto;
        text-align: center;
        position:relative;
    }

    p {
        margin: 0;
        left: 0;
        right: 0;
        top: 80%;
        position: absolute;
        font-size: 2em;
        display: inline-block;
    }
</style>

<div style="--color: {active?niceBlue:"white"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
    <p>
        {label}
    </p>
</div>