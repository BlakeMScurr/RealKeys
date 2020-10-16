<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NewNote, Note, notesBetween, Line } from "../../../lib/music/theory/notes.ts";
    import { blackAndGhostBetween, Ghost, whiteWidths, regularWhiteWidth, keyboardInputNote, label } from "./piano.ts";
    import WebMidi, { InputEventNoteon, InputEventNoteoff } from "webmidi";
    import Key from "./Key/Key.svelte";

    export let keys:Array<Note>;
    export let usedNotes:Map<String, boolean> = new Map();

    let midiConnected = false
    let mobile = false // TODO: figure out how to know this before we get any events
    $: labelsOn = !midiConnected && !mobile
    $: labels = labelsOn ? label(new Line(keys)) : new Map();

    const dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail);
    }

    let notes = new Line(keys)
    $: notes = new Line(keys)
    // TODO: allow playing notes that aren't on screen
    let activeMap = notes.activeMap()

    // setup midi keyboard input
    // TODO: continusously try to connect
    let enableWebMidi;
    enableWebMidi = () => {
        WebMidi.enable(function (err) {
            if (err) {
                console.warn("WebMidi could not be enabled.", err);
            } else {
                let addListeners;
                addListeners = () => {
                    try {
                        WebMidi.inputs[0].addListener('noteon', "all", (e: InputEventNoteon) => {
                            activeMap.set(NewNote(e.note.name, e.note.octave).string(), true)
                            activeMap = activeMap // trigger svelte update
                        });
                        WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
                            activeMap.set(NewNote(e.note.name, e.note.octave).string(), false)
                            activeMap = activeMap // trigger svelte update
                        });
                        midiConnected = true
                    } catch (e) {
                        // TODO: handle disconnects too
                        console.log("trying to connect midi again") // TODO: non polling solution
                        setTimeout(addListeners, 200)
                    } 
                }
                addListeners()
            }
        });
    }

    enableWebMidi()

    // setup computer keyboard input
    function setActive(charCode: number, isActive: Boolean) {
        let changedNote = keyboardInputNote(charCode, notes)
        if (changedNote != undefined) {
            activeMap.set(changedNote.string(), isActive)
            activeMap = activeMap // trigger svelte update
        }
    }

    document.addEventListener('keydown', (event) => {
        mobile = false
        setActive(event.keyCode, true)
    });
    
    document.addEventListener('keyup', (event) => {
        mobile = false
        setActive(event.keyCode, false)
    });

    function getLabel(labels, note) {
        if (usedNotes.size == 0) {
            return labels.get(note.string()) ? labels.get(note.string()) : ""
        } else if (usedNotes.has(note.string())) {
            return labels.get(note.string()) ? labels.get(note.string()) : ""
        }
        return ""
    }
</script>

<style>
    div {
        height: 100%;
    }
    
    .rapper {
        position: absolute;
        pointer-events: none;
        width: 100%;
    }

    #JuiceWrld {
        margin-left: var(--blackMargin);
    }

</style>

<div on:touchstart={()=>{mobile = true}}>
    <div class="rapper" id="LilPeep">
        {#each whiteWidths(notes.white()) as {note, width}}
            <Key {note} width={width} active={activeMap.get(note.string())} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={usedNotes.has(note.string())}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key {note} width={regularWhiteWidth(notes.white())*100} active={activeMap.get(note.string())} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={usedNotes.has(note.string())}></Key>
            {/if}
        {/each}
    </div>
</div>