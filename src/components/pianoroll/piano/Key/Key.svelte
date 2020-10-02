<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import Black from "./Black.svelte"
    import White from "./White.svelte"
    import Ghost from "./Ghost.svelte"

    export let width:number;
    export let note:Note;
    export let active:Boolean;
    export let ghost:Boolean = false;
    export let label:String = "";

    console.log(label)

    let dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail)
    }
</script>

<style>
    div {
        display: inline-block;
        height: 100%;
        width: var(--width);
        pointer-events:none;
        float: left; /* fixes positioning with label text added per https://stackoverflow.com/questions/17902102/div-position-changed-when-text-is-added */
    }
</style>

<div style="--width: {width}%;">
    {#if ghost}
        <Ghost></Ghost>
    {:else}
        {#if note.color() == "white"}
            <White {note} bind:active={active} on:noteOn={forward} on:noteOff={forward} {label}></White>
        {:else}
            <Black {note} bind:active={active} on:noteOn={forward} on:noteOff={forward} {label}></Black>
        {/if}
    {/if}
</div>