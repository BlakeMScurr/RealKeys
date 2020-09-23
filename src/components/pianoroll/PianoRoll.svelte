<script lang="ts">
    import type { Bars, TimedNotes } from "./pianoroll";
    import { position } from "../stores"
    import ZoomArea from "../bars/zoom/ZoomArea.svelte";
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";

    export let notes:TimedNotes;
    export let bars:Bars;

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    $: zoomEnd = pos;
    $: zoomStart = pos - 0.2; // TODO: use a fixed amount of time as a the fixed zoom window

    let keys = notes.range();
</script>

<style>
    #pianoroll {
        width: 100%;
        height: 400px;
        position: relative;
    }

    .container {
        position: relative;
        width: 100%;
    }

    .roll {
        height: 70%;
    }

    .piano {
        height: 30%;
    }

  
</style>

<div id="pianoroll">
    <div class="container roll">
        <Roll {keys} {bars} {notes} height={100} unit={"%"} {zoomStart} {zoomEnd}></Roll>
    </div>
    <div class="container piano">
        <Piano {keys}></Piano>
    </div>
</div>