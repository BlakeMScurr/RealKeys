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

    let tmpNotes:TimedNotes;
    let recorder = new Recorder();
    function startRecording(){
        // TODO: add a big red line at the top of the page
        recorder.start(pos);
        tmpNotes = notes
        notes = recorder.getNotes()
    }

    function stopRecording() {
        recorder.stop(pos)
        // TODO: merge newly recorded notes
        notes = tmpNotes
        recorder = new Recorder();
    }

    function noteOn(event) {
        // TODO: consistent up/down off/on naming - we only need one pair
        recorder.down(event.detail, pos)
        notes = recorder.getNotes()
    }
    
    function noteOff(event) {
        recorder.up(event.detail, pos)
        notes = recorder.getNotes()
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

<RecordButton on:startRecording={startRecording} on:stopRecording={stopRecording}></RecordButton>
<div id="pianoroll">
    <div class="container roll">
        <Roll {keys} {bars} {notes} height={100} unit={"%"} {zoomStart} {zoomEnd}></Roll>
    </div>
    <div class="container piano">
        <Piano {keys} on:noteOn={noteOn} on:noteOff={noteOff}></Piano>
    </div>
</div>