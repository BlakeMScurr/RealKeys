<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import { colour } from "./helper"
    import EventHandler from "./EventHandler.svelte"
    import type { keyState } from "../pianoHelpers";
    
    export let state:keyState;
    export let note:Note;
    export let label: String = "";
    export let used: Boolean = false;
    
    let active:Boolean;
    const dispatch = createEventDispatcher()
    $: {
        dispatch(active ? "noteOn": "noteOff", note)
    }
</script>

<style>
      div {
        background-color: var(--color);
        /* TODO: why is there an overflow in the piano roll at higher key counts but not lower ones (see piano roll stories) */
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        border: 1px solid grey;
        pointer-events:auto;
        text-align: center;
        position:relative;
    }

    p {
        margin: 0;
        left: 0;
        right: 0;
        top: calc(64%);
        position: absolute;
        font-size: 1.75em;
        display: inline-block;
        pointer-events: none;
    }

    .used {
        border-color: #38A3FA;
        border-width: 3px;
        width:  calc(100% - 6px);
        height:  calc(100% - 6px);
        z-index: 1;
    }
</style>

<div class={used?"used":""} style="--color: {colour(state, false)}">
    <EventHandler bind:active></EventHandler>
    <p>
        {label}
    </p>
</div>