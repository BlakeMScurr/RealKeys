<script lang="ts">
    import type { Bars, TimedNotes } from "./pianoroll";
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";

    export let notes:TimedNotes;
    export let bars:Bars;

    let keys = notes.range();
</script>

<style>
    #pianoroll {
        width: 100%;
        height: 400px;
        background-color: red;
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
        <Roll {keys} {bars} {notes} height={100} unit={"%"}></Roll>
    </div>
    <div class="container piano">
        <Piano {keys}></Piano>
    </div>
</div>