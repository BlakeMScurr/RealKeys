<script lang="ts">
    import type { Note } from "../music/theory/notes";
    import { Line } from "../music/theory/notes";
    import { notesBetween, fillGhosts, Ghost, whiteWidths, regularWhiteWidth } from "./piano";
    import Key from "./Key/Key.svelte";

    export let lowest: Note;
    export let highest: Note;

    let notes = new Line(notesBetween(lowest, highest))
</script>

<style>
    .rapper {
        position: absolute;
        pointer-events: none;
        width: 100%;
    }

    #JuiceWrld {
        margin-left: var(--blackMargin);
    }

</style>

<div>
    <div class="rapper" id="LilPeep">
        {#each whiteWidths(notes.white()) as {note, width}}
            <Key {note} width={width}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each fillGhosts(notes.black()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key {note} width={regularWhiteWidth(notes.white())*100}></Key>
            {/if}
        {/each}
    </div>
</div>