<script lang="ts">
    import type { Note } from "../music/theory/notes";
    import type { Bars } from "../pianoroll";
    import RollKey from "./RollKey.svelte";

    export let notes:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
</script>

<style>
    .container {
        width: 100%;
        height: var(--height);
        position: absolute;
    }

    .barlines {
        pointer-events: none;
    }

    .bar {
        margin-top: calc(var(--margin-top) - 1px);
        height: 1px;
        background-color: white;
        width: 100%;
    }
</style>

<div class="container" style="--height: {height + unit};">
    {#each notes as note}
       <RollKey width={100/notes.length + "%"} height={"100%"} white={note.color()=="white"} rightBorder={note.abstract.letter == "b" || note.abstract.letter == "e"}></RollKey> 
    {/each}
</div>
<div class="container barlines" style="--height: {height + unit};">
    {#each bars.bars as bar}
        <div class="bar" style="--margin-top: {height * bar + unit};"></div>
    {/each}
</div>