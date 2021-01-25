<script lang="ts">
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Colourer } from "../../colours";
    import type { Bars } from "../pianoRollHelpers";
    import RollBackground from "./RollBackground.svelte";

    export let debugSliders: boolean = false
    export let position: number = 0
    export let zoomWidth: number = 0.5
    export let keys: Array<Note>;
    export let songDuraion: number = 10000;
    export let colourer: Colourer;
    export let bars: Bars;
    export let tracks:  Map<string, TimedNotes>;
    export let overlayNotes: TimedNotes;
</script>

<style lang="scss">
    .grandaddy {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .noteholder {
        position: absolute;
        display: flex;
        height: 100%;
        width: 100%;
        top: 0;

        div {
            flex-grow: 1;
            opacity: 0.5;
        }
    }
</style>

<div class="grandaddy">
    <RollBackground {keys}></RollBackground>
    <div class="noteholder">
        {#each keys as key}
            <div class="keyholder">
                {#each Array.from(tracks.values()) as track}
                    {#each track.notes as note}
                        {#if note.note.equals(key)}
                            <div>
                                {note}
                            </div> 
                        {/if}
                    {/each}
                {/each}
            </div>
        {/each}
    </div>
</div>