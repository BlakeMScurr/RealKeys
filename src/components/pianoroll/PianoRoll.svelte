<script lang="ts">
    import { range, Bars, pushBottomKey, pushTopKey, popBottomKey, popTopKey } from "./pianoRollHelpers";
    import { RecordState } from "./recorder";
    import { TimedNotes } from "../../lib/music/timed/timed"
    import { currentSong, playingStore, position, songDuration, seek, tracks } from "../../stores/stores"
    import RecordButton from "../generic/RecordButton.svelte"
    import Roll from "./roll/Roll.svelte";
    import GLRoll from "./roll/GLRoll.svelte";
    import Piano from "./piano/Piano.svelte";
    import type { VirtualInstrument } from "../track/instrument";
    import { newPiano } from "../track/instrument";

    export let notes:TimedNotes = new TimedNotes([]);
    export let bars:Bars;
    export let recordMode:Boolean = false;
    export let instrument: VirtualInstrument;
    export let gl:Boolean = false;

    // TODO: track handling at the lesson level
    let state = new Map<string, string>();
    let updatenotes
    let updateInstrument
    if (!recordMode) {
        let playbackinterface = tracks.newPlaybackTrack(notes.notes, instrument)
        playbackinterface.subscribeToNotes((notes: Map<string, string>)=>{
            // TODO: only bother sending the strings
            state = new Map<string, string>();
            notes.forEach((noteState, noteName: string)=>{
                state.set(noteName, noteState)
            })
            state = state
        })
        updatenotes = (notes)=>{playbackinterface.updateNotes(notes)}
        updateInstrument = (instrument) => {playbackinterface.updateInstrument(instrument)}
    }

    $: {
        updatenotes(notes)
    }

    $: {
        updateInstrument(instrument)
    }

    // TODO: allow one to use the same MIDI instrument as the track being played against
    let piano = newPiano("Player Piano")

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    let width = 0;
    $: keys = range(notes.untime(), piano.highest(), piano.lowest())
    let lastWidth = -1;
    $: {
        if (width == lastWidth) {} else if (width <= 0) {
            setTimeout(() => {
                keys = range(notes.untime(), piano.highest(), piano.lowest())
            }, 1000);
        }
        lastWidth = width
    }
    
    // ROLL ZOOM
    let seekTimeout;
    function handleRollWheel(event) {
        playingStore.pause()
        event.preventDefault()
        pos -= event.deltaY * 2 / duration
        pos = pos < 0 ? 0 : pos
        pos = pos > 1 ? 1 : pos
        clearTimeout(seekTimeout)
        seekTimeout = setTimeout(()=> {
            seek.set(pos)
        }, 200)
        // TODO: widen the piano with deltaX
    }

    function handleTouchMove(event) {
        handleRollWheel(event)
    }

    let duration = 5;
    songDuration.subscribe((val)=> {
        duration = val
    })

    // PIANO ZOOM
    // TODO: zoom in on current location of mouse (i.e., the current note), not just the bottom note
    // This can probably be done by getting the mouse x position with respect to the hovered key, and removing
    // the top note if we're on the left side and vice versa
    let dy = 0
    const zoomDamper = 20 // higher number lower speed
    $: {
        // TODO: get some response from the UI as we scroll before we add a new key so the user can see what's going on
        if (dy > zoomDamper) {
            pushTopKey(keys, piano)
            keys = keys
            dy = 0
        } else if (dy < -zoomDamper){
            if (keys.length >= 15) { // TODO: make this number depend on the actual view window etc
                popTopKey(keys)
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
        if (Math.abs(dx) > shiftDamper) {
            if (dx < 0 && pushTopKey(keys, piano)) {
                popBottomKey(keys)
            } else if (dx > 0 && pushBottomKey(keys, piano)) {
                popTopKey(keys)
            }
            dx = 0
        }
        keys = keys
    }

    // TODO: less jerky dragging
    let dragging = false
    function handlemouseleave() {
        dragging = false
    }

    function handlemouseup(event) {
        dragging = false
    }

    function handlemousedown(event) {
        dragging = true
    }

    function handlemousemove(event) {
        if (dragging) {
            dx += event.movementX / 5 // TODO: make dx correspond to actual pixels so the speed works properly
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

    let playing = false
    playingStore.subscribe((p: boolean)=>{
        playing = p
        if (!recordMode) {
            if (p) {
                startRecording()
            } else {
                stopRecording()
            }
        }
    })

    function noteOff(event) {
        piano.stop(event.detail)
        if (recordMode) {
            notes = recorder.noteOff(event, pos)
        } else {
            overlayNotes = recorder.noteOff(event, pos)
        }
    }

    function noteOn(event) {
        piano.play(event.detail)
        if (recordMode) {
            notes = recorder.noteOn(event, pos)
        } else {
            overlayNotes = recorder.noteOn(event, pos)
        }
    }

    function startRecording() {
        if (recordMode) {
            notes = recorder.startRecording(pos)
        } else {
            overlayNotes = recorder.startRecording(pos)
        }
    }

    function stopRecording() {
        if (recordMode) {
            notes = recorder.stopRecording(pos, true)
            currentSong.set(notes)
        } else {
            overlayNotes = recorder.stopRecording(pos, true)
            currentSong.set(overlayNotes)
        }
    }
</script>

<style lang="scss">
    $pianoHeight: 140px;

    #pianoroll {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .container {
        position: relative;
        width: 100%;
    }

    .roll {
        height: calc(100% - #{$pianoHeight});
    }

    .piano {
        height: $pianoHeight;
    }
</style>

{#if recordMode}
    <RecordButton on:startRecording={startRecording} on:stopRecording={stopRecording}></RecordButton>
{/if}

<div id="pianoroll" bind:clientWidth={width}>
    <div class="container roll" on:wheel={handleRollWheel} on:touchmove={handleTouchMove}>
        {#if !gl}
            <Roll {keys} {bars} {notes} {overlayNotes} height={100} unit={"%"} position={pos} recording={recordMode} editable={recordMode} playing={playing}></Roll>
        {:else}
            <GLRoll {keys} {bars} {notes} {overlayNotes} position={pos} recording={recordMode} editable={recordMode} playing={playing}></GLRoll>
        {/if}
    </div>
    <div class="container piano" on:wheel={handlePianoWheel} on:mousedown={handlemousedown} on:mouseup={handlemouseup} on:mousemove={handlemousemove} on:mouseleave={handlemouseleave}>
    <Piano {keys} lessonNotes={state} {playing} on:noteOff={noteOff} on:noteOn={noteOn} usedNotes={recordMode ? new Map() : notes.untimeRemoveDupes()}></Piano>
    </div>
</div>