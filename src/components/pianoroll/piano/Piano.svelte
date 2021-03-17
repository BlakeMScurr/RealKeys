<script lang="ts">
    import { createEventDispatcher,onDestroy,onMount } from "svelte";
import { less } from "svelte-preprocess";
    import type { InputEventNoteoff,InputEventNoteon } from "webmidi";
    import WebMidi from "webmidi";
    import type { scorer } from "../../../lib/gameplay/score/score";
    import { getKeyState, occupationTracker } from "../../../lib/gameplay/score/stateTracking";
    import type { Note } from "../../../lib/music/theory/notes";
    import { Line,NewNote } from "../../../lib/music/theory/notes";
    import { getSettings,inputType } from "../../../lib/storage";
    import type { SoundFont } from "../../../lib/track/soundfont";
    import { handleErrors } from "../../../lib/util";
    import { noteState } from "../../../stores/track";
    import Key from "./Key/Key.svelte";
    import { blackAndGhostBetween,Ghost,keyboardInputNote,label,regularWhiteWidth,whiteWidths } from "./pianoHelpers";



    export let keys:Array<Note>;
    // TODO: use Map<Note, boolean>
    export let usedNotes:Map<string, boolean> = new Map();
    export let lessonNotes: Map<Note, noteState> = new Map();
    export let sandbox: boolean = false; // sandbox pianos are just for playing, and aren't used to test one on a task
    export let instrument: SoundFont;
    export let position;
    export let scoreKeeper: scorer;
    export let midiOnly = false;

    let midiConnected = false
    let un = new Map();
    let labelsOn = false
    $: labels = labelsOn ? label(new Line(keys)) : new Map();

    // TODO: move to stateTracking.ts
    // If a new note arrives, and the current depression of its key was due to a previous note, then the note should be invalid
    // Played map records whether a given note has been played yet
    let occupation: occupationTracker = new occupationTracker();
    let previousStates = new Map<Note, noteState>();
    $: {
        let newPreviousStates = new Map<Note, noteState>();
        if (lessonNotes) {
            scoreKeeper.expect(lessonNotes)
            lessonNotes.forEach((value, note) => {
                if (value === noteState.softStart) {
                    if (!previousStates.has(note)) {
                        occupation.expect(note)
                    } else {
                        if (previousStates.get(note) !== noteState.softStart) {
                            occupation.unexpect(note)
                            occupation.expect(note)
                        }
                    }
                }
                newPreviousStates.set(note, value)
            })
        }

        previousStates.forEach((_, note) => {
            if (!newPreviousStates.has(note)) {
                occupation.unexpect(note)
            }
        })

        previousStates = newPreviousStates
    }

    function touchNoteEvent(e) {
        if (!midiOnly) {
            forward(e)
        }
    }

    const dispatch = createEventDispatcher();
    // TODO: this is a misnomer, this is actually the thing that plays all notes
    function forward(e) {
        scoreKeeper.inputChange()
        let note: Note = e.detail
        activeMap.set(note, e.type === "noteOn")
        activeMap = activeMap

        let playingNotes = new Array<Note>();
        activeMap.forEach((k, v) => {
            if (k) {
                playingNotes.push(v)
            }
        })

        if (e.type === "noteOn") {
            instrument.play(note)
            occupation.play(note)
        } else {
            instrument.stop(note)
            occupation.stop(note)
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

        labelsOn = getSettings() === inputType.qwerty && !midiOnly

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

    function getLabel(labels, note) {
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
            <Key width={width} {note} state={getKeyState(note, activeMap, lessonNotes, occupation, sandbox, scoreKeeper, position)} on:noteOn={touchNoteEvent} on:noteOff={touchNoteEvent} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key width={regularWhiteWidth(notes.white())*100} {note} state={getKeyState(note, activeMap, lessonNotes, occupation, sandbox, scoreKeeper, position)} on:noteOn={touchNoteEvent} on:noteOff={touchNoteEvent} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
            {/if}
        {/each}
    </div>
</div>