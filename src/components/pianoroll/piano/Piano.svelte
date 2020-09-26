<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { NewNote, Note, notesBetween } from "../../../lib/music/theory/notes.ts";
    import { Line } from "../../../lib/music/theory/notes.ts";
    import { blackAndGhostBetween, Ghost, whiteWidths, regularWhiteWidth, keyboardInputNote } from "./piano.ts";
    import WebMidi, { InputEventNoteon, InputEventNoteoff } from "webmidi";
    import Key from "./Key/Key.svelte";

    export let keys:Array<Note>;

    const dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail);
    }

    let notes = new Line(keys)
    $: notes = new Line(keys)
    let activeMap = notes.activeMap()

    // setup midi keyboard input
    // TODO: test
    WebMidi.enable(function (err) {
        try {
            WebMidi.inputs[0].addListener('noteon', "all", (e: InputEventNoteon) => {
                activeMap.set(NewNote(e.note.name, e.note.octave).string(), true)
                activeMap = activeMap // trigger svelte update
            });
            WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
                activeMap.set(NewNote(e.note.name, e.note.octave).string(), false)
                activeMap = activeMap // trigger svelte update
            });
        } catch (e) {}
    });

    // setup computer keyboard input
    function setActive(charCode: number, isActive: Boolean) {
        let changedNote = keyboardInputNote(charCode, notes)
        if (changedNote != undefined) {
            activeMap.set(changedNote.string(), isActive)
            activeMap = activeMap // trigger svelte update
        }
    }

    document.addEventListener('keydown', (event) => {
        setActive(event.keyCode, true)
    });
    
    document.addEventListener('keyup', (event) => {
        setActive(event.keyCode, false)
    });
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

<div>
    <div class="rapper" id="LilPeep">
        {#each whiteWidths(notes.white()) as {note, width}}
            <Key {note} width={width} active={activeMap.get(note.string())} on:noteOn={forward} on:noteOff={forward}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key {note} width={regularWhiteWidth(notes.white())*100} active={activeMap.get(note.string())} on:noteOn={forward} on:noteOff={forward}></Key>
            {/if}
        {/each}
    </div>
</div>