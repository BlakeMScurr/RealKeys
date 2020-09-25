<script lang="ts">
    import type { Bars } from "./pianoroll";
    import { Recorder, TimedNotes } from "../../lib/music/timed/timed"
    import { position } from "../stores"
    import RecordButton from "../generic/RecordButton.svelte"
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";
    import { isNull } from "util";

    export let notes:TimedNotes = new TimedNotes([]);
    export let bars:Bars;

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    let zoomWidth = 0.2 // TODO: use a fixed amount of time as a the fixed zoom window
    $: zoomEnd = pos;
    $: zoomStart = pos - zoomWidth;

    let keys = notes.range();

    function handleWheel(event) {
        event.preventDefault()
        pos -= event.deltaY / 1000
        pos = pos < 0 ? 0 : pos
        pos = pos > 1 ? 1 : pos

        // TODO: widen the piano with deltaX
    }

    // Recording handling
    // -------------------------------------------
    //
    // TODO: move to a separate file
    let tmpNotes:TimedNotes;
    let recorder:Recorder = null;
    function startRecording(){
        recorder = new Recorder();
        // TODO: add a big red line at the top of the page
        recorder.start(pos);
        tmpNotes = notes
        // TODO: show previous notes while recording
        notes = recorder.getNotes()
    }

    function stopRecording() {
        recorder.stop(pos)
        // TODO: merge newly recorded notes
        notes = recorder.merge(tmpNotes);
        recorder = null;
    }

    function noteOn(event) {
        if (!isNull(recorder)) {
            // TODO: consistent up/down off/on naming - we only need one pair
            recorder.down(event.detail, pos)
            notes = recorder.getNotes()
        }
    }
    
    function noteOff(event) {
        if (!isNull(recorder)) {
            recorder.up(event.detail, pos)
            notes = recorder.getNotes()
        }
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
<div id="pianoroll" on:wheel={handleWheel}>
    <div class="container roll">
        <Roll {keys} {bars} {notes} height={100} unit={"%"} {zoomStart} {zoomEnd}></Roll>
    </div>
    <div class="container piano">
        <Piano {keys} on:noteOn={noteOn} on:noteOff={noteOff}></Piano>
    </div>
</div>