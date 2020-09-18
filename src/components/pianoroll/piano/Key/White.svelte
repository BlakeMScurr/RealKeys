<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../music/theory/notes";
    
    export let active:Boolean;
    export let note:Note;
    const dispatch = createEventDispatcher()
    $: {dispatch(active ? "noteOn": "noteOff", note)}
</script>

<style>
      div {
        background-color: var(--color);
        /* TODO: account for border in width */
        width: 100%;
        height: 100%;
        border: 1px solid grey;
        pointer-events:auto;
    }
</style>

<div style="--color: {active?"#667ED4":"white"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
</div>