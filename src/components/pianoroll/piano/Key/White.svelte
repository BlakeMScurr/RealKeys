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
        /* TODO: why is there an overflow unless width is subtracted by 3px? I thought 2 would suffice to account for the border on either side */
        width: calc(100% - 3px);
        height: 100%;
        border: 1px solid grey;
        pointer-events:auto;
    }
</style>

<div style="--color: {active?niceBlue:"white"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
</div>