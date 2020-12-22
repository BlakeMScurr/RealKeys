<script lang="ts">
    import { range, Bars, pushBottomKey, pushTopKey, popBottomKey, popTopKey } from "./pianoRollHelpers";
    import { TimedNotes } from "../../lib/music/timed/timed"
    import type { GameMaster } from "../../stores/stores"
    import Piano from "./piano/Piano.svelte";
    import { newPiano } from "../../lib/track/instrument";
    import Roll from "./roll/Roll.svelte";
    import { createEventDispatcher } from 'svelte';

    export let notes:TimedNotes = new TimedNotes([]);
    export let bars:Bars;
    export let state: Map<string, string> = new Map<string, string>();
    export let gm: GameMaster;

    let dispatch = createEventDispatcher();

    // TODO: allow one to use the same MIDI instrument as the track being played against
    let piano = newPiano("Player Piano")

    let pos = 0;
    gm.position.subscribe((value) => {
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
    function handleRollWheel(event) {
        gm.playingStore.pause()
        event.preventDefault()
        pos -= event.deltaY * 2 / duration
        pos = pos < 0 ? 0 : pos
        pos = pos > 1 ? 1 : pos
        gm.seek.set(pos)
        // TODO: widen the piano with deltaX
    }

    function handleTouchMove(event) {
        handleRollWheel(event)
    }

    let duration = 5;
    gm.songDuration.subscribe((val)=> {
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

    function noteOff(event) {
        piano.stop(event.detail)
    }

    let inWaitMode = false;
    gm.waitMode.subscribe((val) => {
        inWaitMode = val
    })

    function noteOn(event) {
        piano.play(event.detail)
        dispatch("noteOn", event.detail)
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

<div id="pianoroll" bind:clientWidth={width}>
    <div class="container roll" on:wheel={handleRollWheel} on:touchmove={handleTouchMove}>
        <Roll {keys} {bars} {notes} position={pos} songDuration={gm.songDuration}></Roll>
    </div>
    <div class="container piano" on:wheel={handlePianoWheel} on:mousedown={handlemousedown} on:mouseup={handlemouseup} on:mousemove={handlemousemove} on:mouseleave={handlemouseleave}>
    <Piano {keys} lessonNotes={state} playing={gm.playingStore} waitMode={gm.waitMode} on:noteOff={noteOff} on:noteOn={noteOn} usedNotes={notes.untimeRemoveDupes()}></Piano>
    </div>
</div>