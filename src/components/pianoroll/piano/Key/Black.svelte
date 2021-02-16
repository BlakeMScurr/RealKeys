<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Note } from "../../../../lib/music/theory/notes";
    import { colour } from "./helper";
    import EventHandler from "./EventHandler.svelte"
    
    export let state:string;
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
        width: 50%;
        height: 65%;
        margin: 0 25% 0 25%;
        pointer-events:auto;
        text-align: center;
        position:relative;
        z-index: 2;
    }

    p {
        margin: 10 0 0 0;
        right: 0;
        left: 0;
        position: absolute;
        font-size: 1.75em;
        display: inline-block;
        color: white;
        pointer-events: none;
    }

    .used {
        border-color: #38A3FA;
        border-width: 3px;
        border-style: solid;
        width: calc(50% - 6px);
        height: calc(65% - 6px);
    }
</style>

<div class={used?"used":""} style="--color: {colour(state, true)}">
    <EventHandler bind:active></EventHandler>
    <p>
        {label}
    </p>
</div>