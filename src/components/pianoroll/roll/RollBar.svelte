<script lang="ts">
    import type { Note } from "../music/theory/notes"
    import RollKey from "./RollKey.svelte";

    export let notes:Array<Note>;
    export let height:number;
</script>

<style>
    div {
        width: 100%;
        height: var(--height);
    }
</style>

<div style="--height: {height};">
    {#each notes as note}
       <RollKey width={100/notes.length + "%"} height={"100%"} white={note.color()=="white"} rightBorder={note.abstract.letter == "b" || note.abstract.letter == "e"}></RollKey> 
    {/each}
</div>