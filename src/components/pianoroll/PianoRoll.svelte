<script lang="ts">
    import type { Bars } from "./pianoroll";
    import type { TimedNotes } from "../../lib/music/timed/timed"
    import { Recorder } from "../../lib/music/timed/timed"
    import { position } from "../stores"
    import RecordButton from "../generic/RecordButton.svelte"
    import ZoomArea from "../bars/zoom/ZoomArea.svelte";
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";

    export let notes:TimedNotes;
    export let bars:Bars;

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    $: zoomEnd = pos;
    $: zoomStart = pos - 0.2; // TODO: use a fixed amount of time as a the fixed zoom window

    let keys = notes.range();

    let recorder = new Recorder();
    function startRecording(){
        // TODO: add a big red line at the top of the page
        recorder.start(pos);
    }

    function stopRecording() {
        recorder.stop(pos)
        // TODO: update the notes
        recorder = new Recorder();
    }
</script>

<style>
    #pianoroll {
        width: 100%;
        height: 400px;
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

<RecordButton on:startRecording={startRecording} on:stopRecording={()=>{stopRecording}}></RecordButton>
<div id="pianoroll">
    <div class="container roll">
        <Roll {keys} {bars} {notes} height={100} unit={"%"} {zoomStart} {zoomEnd}></Roll>
    </div>
    <div class="container piano">
        <Piano {keys}></Piano>
    </div>
</div>