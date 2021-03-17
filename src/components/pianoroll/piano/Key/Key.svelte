<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import Black from "./Black.svelte"
    import White from "./White.svelte"
    import Ghost from "./Ghost.svelte"
    import type { keyState } from "../pianoHelpers";

    export let width:number;
    export let note:Note;
    export let active:Boolean;
    export let state:keyState;
    export let ghost:Boolean = false;
    export let label:String = "";
    export let used:Boolean = false;

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
    {:else if note.color() == "white"}
        <White {note} on:noteOn={forward} on:noteOff={forward} {label} {used} {state}></White>
    {:else}
        <Black {note} on:noteOn={forward} on:noteOff={forward} {label} {used} {state}></Black>
    {/if}
</div>