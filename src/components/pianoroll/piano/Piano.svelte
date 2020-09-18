<script lang="ts">
    import type { Note } from "../music/theory/notes";
    import { Line } from "../music/theory/notes";
    import { notesBetween, fillGhosts, Ghost } from "./piano";
    import Key from "./Key/Key.svelte";

    export let lowest: Note;
    export let highest: Note;

    let notes = new Line(notesBetween(lowest, highest))

    let noteWidth = 50
    let noteHeight = 200
</script>

<style>
    .rapper {
        position: absolute;
        pointer-events: none;
    }

    #JuiceWrld {
        margin-left: var(--blackMargin)
    }
</style>

<div>
    <div class="rapper" id="LilPeep">
        {#each notes.white() as note}
            <Key {note} width={noteWidth} height={noteHeight}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {noteWidth/2}px;" class="rapper" id="JuiceWrld">
        {#each fillGhosts(notes.black()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={noteWidth} height={noteHeight}></Key>
            {:else}
                <Key {note} width={noteWidth} height={noteHeight}></Key>
            {/if}
        {/each}
    </div>
</div>