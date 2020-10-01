<script lang="ts">
    import type { Bars } from "./pianoroll";
    import { RecordState } from "./recorder";
    import { TimedNotes } from "../../lib/music/timed/timed"
    import { currentSong, playingStore, position } from "../stores"
    import RecordButton from "../generic/RecordButton.svelte"
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";

    export let notes:TimedNotes = new TimedNotes([]);
    export let bars:Bars;
    export let recordMode:Boolean = true;

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    let keys = notes.range();

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

    // RecordMode stuff
    // TODO: in play mode, send signals to piano to render success or failure of attempt
    // - Extra or missed note should make played key red
    // - Hit note should be green
    // Have some leeway

    let overlayNotes = new TimedNotes([]);

    let recorder;
    if (recordMode) {
        recorder = new RecordState(notes)
    } else {
        recorder = new RecordState(overlayNotes)
    }
   
    playingStore.subscribe((playing: boolean)=>{
        if (!recordMode) {
            if (playing) {
                startRecording()
            } else {
                stopRecording()
            }
        }
    })

    function noteOff(event) {
        if (recordMode) {
            notes = recorder.noteOff(event, pos)
        } else {
            overlayNotes = recorder.noteOff(event, pos)
        }
    }

    function noteOn(event) {
        if (recordMode) {
            notes = recorder.noteOn(event, pos)
        } else {
            overlayNotes = recorder.noteOn(event, pos)
        }
    }

    function startRecording() {
        notes = recorder.startRecording(pos)
    }

    function stopRecording() {     
        notes = recorder.stopRecording(pos, true)
        currentSong.set(notes)
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

{#if recordMode}
    <RecordButton on:startRecording={startRecording} on:stopRecording={stopRecording}></RecordButton>
{/if}
<div id="pianoroll">
    <div class="container roll" on:wheel={handleRollWheel}>
        <Roll {keys} {bars} {notes} {overlayNotes} height={100} unit={"%"} position={pos} recording={recordMode}></Roll>
    </div>
    <div class="container piano" on:wheel={handlePianoWheel}>
        <Piano {keys} on:noteOff={noteOff} on:noteOn={noteOn}></Piano>
    </div>
</div>