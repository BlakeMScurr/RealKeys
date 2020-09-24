<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import { niceBlue } from "../../../colours";
    import type { Note } from "../../../../lib/music/theory/notes";
    
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
        width: 50%;
        height: 65%;
        margin: 0 25% 0 25%;
        pointer-events:auto;
    }
</style>

<div style="--color: {active?niceBlue:"black"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
</div>