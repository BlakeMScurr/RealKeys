<script lang="ts">
import { onMount } from "svelte";

    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
    import type { Colourer } from "../../colours";
    import RollBackground from "./RollBackground.svelte";

    export let debugSliders: boolean = false
    export let position: number = 0
    export let zoomWidth: number = 1
    export let keys: Array<Note>;
    export let duration: number = 5000;
    export let colourer: Colourer;
    export let tracks:  Map<string, TimedNotes>;

    export let heightElement;

    // show 5 seconds
    $: zoomWidth = 5000/duration

    // TODO: FUCKING GET RID OF THIS PIECE OF SHIT PILE OF TRASH
    // bs hackery to get the height working on iPhone, the height of grandaddy, despite being 100%, is 0px, while the parent (also relatively positioned) has a non zero pixel height
    let gd;
    let mounted

    onMount(() => {
        mounted = true
    })

    let hacked = false
    $: {
        if (!hacked && heightElement && gd && heightElement.clientHeight) {
            if (heightElement.clientHeight != gd.clientHeight) {
                gd.style.height = heightElement.clientHeight + "px"
            }
        }
    }

    // TODO: use a logically identical function to this to hide notes that are off the screen. But implement it as a store that fires off show/hide note events based on position
    // to update a map of which notes should be shown. This means we only have one small function firing for every position update, which reads off a queue which is a simple computation,
    // and the only other computation is when a note is shown or hidden. The current implementation checks if every note is in bounds every time the position changes.
    // TODO: change back to PIXI once the gameplay is somewhat verified.
    function withinBounds(note: TimedNote, position: number, zoomWidth: number):boolean {
        return (note.start > position && note.start < position + zoomWidth) || (note.end > position && note.end < position + zoomWidth)
    }

</script>

<style lang="scss">
    .grandaddy {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .fader {
        position: absolute;
        height: 30%;
        top: 0;
        width: 100%;
        background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
        z-index: 1;
    }
    .noteholder {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        top: var(--top);

        div {
            flex-grow: 1;
        }
    }

    .keyholder {
        position: relative;
        transform: rotate(180deg);
    }

    .note {
        width: 100%;
        height: calc(var(--height));
        top: calc(var(--top));
        position: absolute;
        background-color: var(--color);
        opacity: 1;
        z-index: 1;
        border-radius: 10px;
    }
</style>

<div class="grandaddy" bind:this={gd}>
    <RollBackground {keys}></RollBackground>
    <div class="fader"></div>
    <div class="noteholder" style="--top: {position*100/zoomWidth}%">
        {#each keys as key}
        <!-- TODO: why does the keyholder inherit the --top variable from the noteholder? Does this massive increase the required rendering time? -->
            <div class="keyholder">
                {#each Array.from(tracks.values()) as track, trackNum}
                    {#each track.notes as note}
                        {#if note.note.equals(key)}
                            <div class="note" style="--top: {note.start * 100 / zoomWidth}%; --height: {(note.end - note.start)*100 / zoomWidth}%; --color: {colourer.hex(trackNum)}"></div> 
                        {/if}
                    {/each}
                {/each}
            </div>
        {/each}
    </div>
</div>

{#if debugSliders}
    <input type="range" bind:value={position} min="0" max="1" step="0.0001">
    position {position}
    <br>
    <input type="range" bind:value={zoomWidth} min="0" max="1" step="0.0001">
    zoom {zoomWidth}
{/if}