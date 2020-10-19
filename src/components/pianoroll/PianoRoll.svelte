<script lang="ts">
    import type { Bars } from "./pianoroll";
    import { RecordState } from "./recorder";
    import { TimedNotes } from "../../lib/music/timed/timed"
    import { currentSong, playingStore, position, songDuration, seek } from "../../stores/stores"
    import { newPiano } from "../track/instrument";
    import { highestPianoNote, lowestPianoNote } from "../../lib/music/theory/notes"
    import RecordButton from "../generic/RecordButton.svelte"
    import Roll from "./roll/Roll.svelte";
    import Piano from "./piano/Piano.svelte";
    import Slider from "../generic/Slider.svelte"

    export let notes:TimedNotes = new TimedNotes([]);
    export let bars:Bars;
    export let recordMode:Boolean = false;

    let pos = 0;
    position.subscribe((value) => {
        pos = value
    })

    let width = 0;
    let keys = notes.range();
    let lastWidth = -1;
    $: {
        if (width == lastWidth) {} else if (width <= 0) {
            setTimeout(() => {
                keys = notes.range()
            }, 1000);
        }
        lastWidth = width
    }
    
    // ROLL ZOOM
    let seekTimeout;
    function handleRollWheel(event) {
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

    function pushTopKey() {
        if (keys[keys.length-1].lowerThan(highestPianoNote)) {
            keys.push(keys[keys.length-1].next())
            if (keys[keys.length-1].abstract.accidental) {
                keys.push(keys[keys.length-1].next())
            }
        }
    }

    function popTopKey() {
        keys.pop()
        if (keys[keys.length-1].abstract.accidental) {
            keys.pop()
        }
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
            if (lowestPianoNote.lowerThan(keys[0])) {
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
            console.log("increasing by " + event.movementX)
            console.log(event)
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
    let player = newPiano();

    let recorder;
    if (recordMode) {
        recorder = new RecordState(notes)
    } else {
        recorder = new RecordState(overlayNotes)
    }

    let volume = 1;
   
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
        player.stop(event.detail, volume)
        if (recordMode) {
            notes = recorder.noteOff(event, pos)
        } else {
            overlayNotes = recorder.noteOff(event, pos)
        }
    }

    function noteOn(event) {
        player.play(event.detail, volume)
        if (recordMode) {
            notes = recorder.noteOn(event, pos)
        } else {
            overlayNotes = recorder.noteOn(event, pos)
        }
    }

    function startRecording() {
        console.log("strign recorinfg")
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
        height: calc(100% - 180px);
    }

    .piano {
        height: 180px;
    }
</style>

{#if recordMode}
    <RecordButton on:startRecording={startRecording} on:stopRecording={stopRecording}></RecordButton>
    <Slider bind:value={volume}></Slider>
{/if}

<div id="pianoroll" bind:clientWidth={width}>
    <div class="container roll" on:wheel={handleRollWheel}>
        <Roll {keys} {bars} {notes} {overlayNotes} height={100} unit={"%"} position={pos} recording={recordMode} editable={recordMode}></Roll>
    </div>
    <div class="container piano" on:wheel={handlePianoWheel} on:mousedown={handlemousedown} on:mouseup={handlemouseup} on:mousemove={handlemousemove} on:mouseleave={handlemouseleave}>
        <Piano {keys} on:noteOff={noteOff} on:noteOn={noteOn} usedNotes={recordMode ? new Map() : notes.untime()}></Piano>
    </div>
</div>