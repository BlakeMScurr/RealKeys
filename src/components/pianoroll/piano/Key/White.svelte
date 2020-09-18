<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../music/theory/notes";
    
    export let clicked:Boolean;
    export let note:Note;
    const dispatch = createEventDispatcher()
    $: {dispatch(clicked ? "noteOn": "noteOff", note)}
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

<div style="--color: {clicked?"green":"white"}" on:mousedown={()=>{clicked=true}}
    on:mouseup={()=>{clicked=false}}
    on:mouseleave={()=>{clicked=false}}>
</div>