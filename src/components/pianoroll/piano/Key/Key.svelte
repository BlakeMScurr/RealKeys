<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../music/theory/notes";
    import Black from "./Black.svelte"
    import White from "./White.svelte"
    import Ghost from "./Ghost.svelte"

    export let width:number;
    export let note:Note;
    export let active:Boolean;
    export let ghost:Boolean = false;

    let dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail)
    }
</script>

<style>
    div {
        display: inline-block;
        height: 200px;
        width: var(--width);
        pointer-events:none;
    }
</style>

<div style="--width: {width}%;">
    {#if ghost}
        <Ghost></Ghost>
    {:else}
        {#if note.color() == "white"}
            <White {note} bind:active={active} on:noteOn={forward} on:noteOff={forward}></White>
        {:else}
            <Black {note} bind:active={active} on:noteOn={forward} on:noteOff={forward}></Black>
        {/if}
    {/if}
</div>