<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../music/theory/notes";
    import Black from "./Black.svelte"
    import White from "./White.svelte"
    import Ghost from "./Ghost.svelte"

    export let width:number;
    export let height:number;
    export let note:Note;
    export let clicked:Boolean;

    export let ghost:Boolean = false;

    let dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail)
    }
</script>

<style>
    div {
        display: inline-block;
        height: var(--height);
        width: var(--width);
        pointer-events:none;
    }
</style>

<div style="--width: {width}px; --height: {height}px">
    {#if ghost}
        <Ghost></Ghost>
    {:else}
        {#if note.color() == "white"}
            <White {note} bind:clicked={clicked} on:noteOn={forward} on:noteOff={forward}></White>
        {:else}
            <Black {note} bind:clicked={clicked} on:noteOn={forward} on:noteOff={forward}></Black>
        {/if}
    {/if}
</div>