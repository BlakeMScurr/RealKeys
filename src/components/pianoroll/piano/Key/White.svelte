<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import { niceBlue } from "../../../colours";
    
    export let active:Boolean;
    export let note:Note;

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
    }
</style>

<div style="--color: {active?niceBlue:"white"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
</div>