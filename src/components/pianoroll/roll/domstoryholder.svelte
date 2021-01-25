<script lang="ts">
    import type { Note } from "../../../lib/music/theory/notes";
    import type { TimedNotes } from "../../../lib/music/timed/timed";
    import type { Colourer } from "../../colours";
    import type { Bars } from "../pianoRollHelpers";
    import DOMRoll from "./DOMRoll.svelte";

    export let debugSliders: boolean = false
    export let position: number = 0
    export let zoomWidth: number = 0.5
    export let keys: Array<Note>;
    export let songDuraion: number = 10000;
    export let colourer: Colourer;
    export let bars: Bars;
    export let tracks;
    export let overlayNotes: TimedNotes;
</script>

<style>
    div {
        width: 100vw;
        height: 100vh;
    }
</style>

<div>
    <DOMRoll {debugSliders} {position} {zoomWidth} {keys} {songDuraion} {colourer} {bars} {tracks} {overlayNotes}></DOMRoll>
</div>

