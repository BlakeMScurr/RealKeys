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
        width: 50%;
        height: 60%;
        margin: 0 25% 0 25%;
        pointer-events:auto;
    }
</style>

<div style="--color: {clicked?"green":"black"}" on:mousedown={()=>{clicked=true}}
    on:mouseup={()=>{clicked=false}}
    on:mouseleave={()=>{clicked=false}}>
</div>