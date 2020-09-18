<script lang="ts">
    import { niceBlue } from "../../colours";
    import type { Note } from "../music/theory/notes";
    import type { Bars, TimedNotes } from "../pianoroll";
    import RollKey from "./RollKey.svelte";

    export let keys:Array<Note>;
    export let height:number;
    export let unit:string;
    export let bars:Bars;
    export let notes:TimedNotes;

    function find(n: Note, ns: Array<Note>) {
        // TODO: efficient lookup
        for (let i = 0; i < ns.length; i++) {
            const note = ns[i];
            if (note.equals(n)) {
                return i
            }
            
        }
        throw new Error("Couldn't find note " + n.string())
    }
</script>

<style>
    .container {
        width: 100%;
        height: var(--height);
        position: absolute;
    }

    .bar {
        margin-top: calc(var(--margin-top) - 1px);
        height: 1px;
        background-color: white;
        width: 100%;
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
<div class="container barlines" style="--height: {height + unit};">
    {#each bars.bars as bar}
    <div class="bar" style="--margin-top: {height * bar + unit};"></div>
    {/each}
</div>
<div class="container" style="--height: {height + unit};">
    {#each notes.notes as note}
    <div class="note" style="--width: {100/keys.length}%; --left: {find(note.note, keys) * 100/keys.length}%; --height: {100*(note.end-note.start)}%; --top:{100*note.start}%; --color: {niceBlue}"></div>
    {/each}
</div>