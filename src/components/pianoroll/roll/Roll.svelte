<script lang="ts">
    // TOOD: use webgl - cpu spikes on scroll right now
    // TODO: allow scrolling
    import { niceBlue } from "../../colours";
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Bars } from "../pianoroll";
    import RollKey from "./RollKey.svelte";

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;
    export let zoomStart = 0;
    export let zoomEnd = 1;

    // Reverse stuff so that it looks right
    // TODO: no ugly reversing stuff
    $: zs = 1- zoomEnd
    $: ze = 1 - zoomStart

    $: zoomRatio = ze - zs
    $: viewHeight = height / zoomRatio
    $: zoomOffset = height * zs / zoomRatio

    function find(n: Note, ns: Array<Note>) {
        // TODO: efficient lookup
        for (let i = 0; i < ns.length; i++) {
            const note = ns[i];
            if (note.equals(n)) {
                return i
            }
            
        }
        return -1
    }
</script>

<style>
    div {
        overflow: hidden;
    }

    .container {
        width: 100%;
        height: var(--height);
        position: absolute;
    }

    .bar {
        top: var(--top);
        height: 1px;
        background-color: white;
        width: 100%;
        position: absolute;
    }

    .note {
        position: absolute;
        height: 10px;
        left: var(--left);
        top: var(--top);
        width: var(--width);
        /* Subtracting a pixel is a hack to make sure we don't cover the barlines with notes when we have notes that fill up entire bars */
        /* This will probably be irrelevant when most values are input with live audio rather than as numbers */
        /* TODO: either remove this, or only attempt to reveal barlines in select cases, say, those where the next note is immediate or almost immediate */
        height: calc(var(--height) - 1px);
        background-color: var(--color);
    }
</style>

<div class="container" style="--height: {height + unit};">
    {#each keys as key}
       <RollKey width={100/keys.length + "%"} height={"100%"} white={key.color()=="white"} rightBorder={key.abstract.letter == "b" || key.abstract.letter == "e"}></RollKey> 
    {/each}
</div>
<div class="container" style="--height: {height + unit};">
    <!-- TODO: make greyed out space before and after the bars -->
    {#each bars.sums() as bar}
        <div class="bar" style="--top: {(viewHeight * bar - zoomOffset) + unit};"></div>
    {/each}
</div>
<div class="container" style="--height: {height + unit};">
    {#each notes.notes as note}
        {#if find(note.note, keys) != -1}
            <div class="note" style="--width: {100/keys.length}%; --left: {find(note.note, keys) * 100/keys.length}%; --height: {100*((1-note.start)-(1-note.end))/zoomRatio}%; --top:{100*(1-note.end)/zoomRatio - zoomOffset}%; --color: {niceBlue}"></div>
        {/if}
    {/each}
</div>