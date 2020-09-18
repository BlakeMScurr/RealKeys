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
        width: 50%;
        height: 60%;
        margin: 0 25% 0 25%;
        pointer-events:auto;
    }
</style>

<div style="--color: {active?"green":"black"}" on:mousedown={()=>{active=true}}
    on:mouseup={()=>{active=false}}
    on:mouseleave={()=>{active=false}}>
</div>