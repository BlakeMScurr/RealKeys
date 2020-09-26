<script lang="ts">
    import type { Bars } from "./pianoroll";
    import { Recorder, TimedNotes } from "../../lib/music/timed/timed"
    import { position, currentSong } from "../stores"
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

    // Zoom handling
    // -------------------------------------------
    //
    // TODO: move to a separate file


    // ROLL ZOOM
    function handleRollWheel(event) {
        event.preventDefault()
        pos -= event.deltaY / 1000
        pos = pos < 0 ? 0 : pos
        pos = pos > 1 ? 1 : pos
        position.set(pos)
        // TODO: widen the piano with deltaX
    }

    function pushTopKey() {
        keys.push(keys[keys.length-1].next())
        if (keys[keys.length-1].abstract.accidental) {
            keys.push(keys[keys.length-1].next())
        }
    }

    function popTopKey() {
        keys.pop()
        if (keys[keys.length-1].abstract.accidental) {
            keys.pop()
        }
    }

    // PIANO ZOOM
    // TODO: zoom in on current location of mouse (i.e., the current note), not just the bottom note
    // This can probably be done by getting the mouse x position with respect to the hovered key, and removing
    // the top note if we're on the left side and vice versa
    let dy = 0
    const zoomDamper = 20 // higher number lower speed
    $: {
        // TODO: get some response from the UI as we scroll before we add a new key so the user can see what's going on
        if (dy > zoomDamper) {
            pushTopKey()
            keys = keys
            dy = 0
        } else if (dy < -zoomDamper){
            if (keys.length >= 15) { // TODO: make this number depend on the actual view window etc
                popTopKey()
                keys = keys
            }
            dy = 0
        }
    }

    // LEFT RIGHT MOTION
    let dx = 0
    const shiftDamper = zoomDamper
    // TODO: put invert into settings somewhere use accessible
    let invert = -1
    $: {
        if (dx < -shiftDamper) {
            // add a note to the top
            pushTopKey()
            // remove a note from the bottom
            keys.shift()
            if (keys[0].abstract.accidental) {
                keys.shift()
            }
            keys = keys
            dx = 0
        } else if (dx > shiftDamper) {
            // remove a note from the top
            popTopKey()
            // add a note to the bottom
            keys.unshift(keys[0].nextLowest())
            if (keys[0].abstract.accidental) {
                keys.unshift(keys[0].nextLowest())
            }
            keys = keys
            dx = 0
        }
    }

    function handlePianoWheel(event) {
        // zoom in and out
        event.preventDefault()
        dy += event.deltaY
        dx += event.deltaX * invert
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
        currentSong.set(notes)
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
<div id="pianoroll">
    <div class="container roll" on:wheel={handleRollWheel}>
        <Roll {keys} {bars} {notes} height={100} unit={"%"} {zoomStart} {zoomEnd}></Roll>
    </div>
    <div class="container piano" on:wheel={handlePianoWheel}>
        <Piano {keys} on:noteOn={noteOn} on:noteOff={noteOff}></Piano>
    </div>
</div>