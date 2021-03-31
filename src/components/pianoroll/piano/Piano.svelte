<script lang="ts">
    import { createEventDispatcher,onDestroy,onMount } from "svelte";
    import type { InputEventNoteoff,InputEventNoteon } from "webmidi";
    import WebMidi from "webmidi";
    import { modeName } from "../../../lib/gameplay/mode/mode";
    import { getKeyState } from "../../../lib/gameplay/score/stateTracking";
    import type { Note } from "../../../lib/music/theory/notes";
    import { Line,NewNote } from "../../../lib/music/theory/notes";
    import { getSettings, inputType } from "../../../lib/storage";
    import type { SoundFont } from "../../../lib/track/soundfont";
    import { handleErrors } from "../../../lib/util";
    import type { noteState } from "../../../stores/track";
    import Key from "./Key/Key.svelte";
    import { blackAndGhostBetween,Ghost,keyboardInputNote,label,regularWhiteWidth,whiteWidths } from "./pianoHelpers";

    export let keys:Array<Note>;
    // TODO: use Map<Note, boolean>
    export let usedNotes:Map<string, boolean> = new Map();

    export let sandbox: boolean = false; // sandbox pianos are just for playing, and aren't used to test one on a task
    export let instrument: SoundFont;
    export let position;
    export let midiOnly = false;
    export let mode: modeName;
    export let on = true;

    let midiConnected = false
    let settingsQwerty = false
    $: labelsOn = settingsQwerty && !midiOnly && mode !== modeName.play
    $: labels = labelsOn ? label(new Line(keys)) : new Map();

    function touchNoteEvent(e) {
        if (!midiOnly) {
            forward(e)
        }
    }

    const dispatch = createEventDispatcher();
    // TODO: this is a misnomer, this is actually the thing that plays all notes
    function forward(e) {
        let note: Note = e.detail
        activeMap.set(note, e.type === "noteOn")
        activeMap = activeMap

        let playingNotes = new Array<Note>();
        activeMap.forEach((k, v) => {
            if (k) {
                playingNotes.push(v)
            }
        })

        if (e.type === "noteOn" && on) {
            instrument.play(note)
        } else {
            instrument.stop(note)
        }
    
        dispatch("playingNotes", playingNotes)
        dispatch(e.type, note);
    }

    let notes = new Line(keys)
    $: notes = new Line(keys)
    // TODO: allow playing notes that aren't on screen
    let activeMap = notes.activeMap()

    // setup midi keyboard input
    // TODO: continusously try to connect
    // TODO: fix webmidi disabling on refresh, we shouldn't rebuild every component, but rather, the pianoroll etc should stay the same while we're on the same page
    let enableWebMidi;
    enableWebMidi = () => {
        let setup = () => {
            let addListeners;
            addListeners = () => {
                try {
                    WebMidi.inputs[0].addListener('noteon', "all", (e: InputEventNoteon) => {
                        forward({type: "noteOn", detail: NewNote(e.note.name, e.note.octave)})
                    });
                    WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
                        forward({type: "noteOff", detail: NewNote(e.note.name, e.note.octave)})
                    });
                    midiConnected = true
                } catch (e) {
                    // TODO: handle disconnects too
                    setTimeout(addListeners, 200)
                } 
            }
            addListeners()
        }

        if (WebMidi.enabled) {
            setup()
        } else {
            WebMidi.enable(function (err) {
                setup()
            });
        }
    }

    const keypressListener = (event) => {
        if (!event.repeat) {
            setActive(event.key, true)
        }
    }

    const keyupListener = (event) => {
        setActive(event.key, false)
    }

    onMount(() => {
        handleErrors(window)

        settingsQwerty = getSettings() === inputType.qwerty

        enableWebMidi()

        // const listenFor = down ? "keypress" : "keyup"
        document.addEventListener("keypress", keypressListener)
        document.addEventListener("keyup", keyupListener);
    })

    onDestroy(() => {
        if (typeof document !== "undefined") {
            document.removeEventListener("keypress", keypressListener)
            document.removeEventListener("keyup", keyupListener);
        }
    })

    // setup computer keyboard input
    function setActive(key: string, isActive: boolean) {
        if (!midiOnly) {
            let changedNote = keyboardInputNote(key, notes)
            if (changedNote != undefined) {
                forward({type: isActive ? "noteOn" : "noteOff", detail: changedNote})
            }
        }
    }

    function getLabel(labels, usedNotes, note) {
        if (usedNotes.size == 0) {
            return labels.get(note.string()) ? labels.get(note.string()) : ""
        } else if (usedNotes.has(note.string())) {
            return labels.get(note.string()) ? labels.get(note.string()) : ""
        }
        return ""
    }


</script>

<style lang="scss">
    div {
        height: 100%;

        .rapper {
            position: absolute;
            pointer-events: none;
            width: 100%;
        }
    }
    

    #JuiceWrld {
        margin-left: var(--blackMargin);
    }

</style>

<div> 
    <div class="rapper" id="LilPeep">
        {#each whiteWidths(notes.white()) as {note, width}}
            <Key width={width} {note} state={getKeyState(note, activeMap, usedNotes, on)} on:noteOn={touchNoteEvent} on:noteOff={touchNoteEvent} label={getLabel(labels, usedNotes, note)}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key width={regularWhiteWidth(notes.white())*100} {note} state={getKeyState(note, activeMap, usedNotes, on)} on:noteOn={touchNoteEvent} on:noteOff={touchNoteEvent} label={getLabel(labels, usedNotes, note)}></Key>
            {/if}
        {/each}
    </div>
</div>