<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { NewNote, Line, parseNoteString } from "../../../lib/music/theory/notes";
    import type { Note} from "../../../lib/music/theory/notes";
    import { blackAndGhostBetween, Ghost, whiteWidths, regularWhiteWidth, keyboardInputNote, label, occupationTracker } from "./pianoHelpers";
    import type { InputEventNoteon, InputEventNoteoff } from "webmidi";
    import WebMidi from "webmidi";
    import Key from "./Key/Key.svelte";
    import { addGlobalKeyListener } from "../../../lib/util";
    import type { SoundFont } from "../../../lib/track/soundfont";
    import { state } from "../../../lib/lesson/score";

    export let keys:Array<Note>;
    export let usedNotes:Map<String, boolean> = new Map();
    export let lessonNotes: Map<Note, string>;
    export let sandbox: boolean = false; // sandbox pianos are just for playing, and aren't used to test one on a task
    export let instrument: SoundFont;
    export let position;
    export let scorer;

    let midiConnected = false
    let mobile = false // TODO: figure out how to know this before we get any events
    usedNotes = new Map(); // TODO: use this when a setting enables it
    let un = new Map();
    $: labelsOn = !midiConnected && !mobile && false // TODO: use this when a setting enables it
    $: labels = labelsOn ? label(new Line(keys)) : new Map();

    // If a new note arrives, and the current depression of its key was due to a previous note, then the note should be invalid
    // Played map records whether a given note has been played yet
    let occupation: occupationTracker = new occupationTracker();

    let previousStates = new Map<Note, string>();
    $: {
        let newPreviousStates = new Map<Note, string>();
        if (lessonNotes) {
            lessonNotes.forEach((value, note) => {
                if (value === "softstart") {
                    if (!previousStates.has(note)) {
                        occupation.expect(note)
                    } else {
                        if (previousStates.get(note) !== "softstart") {
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

    const dispatch = createEventDispatcher();
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
        WebMidi.enable(function (err) {
            if (err) {
            } else {
                let addListeners;
                addListeners = () => {
                    try {
                        WebMidi.inputs[0].addListener('noteon', "all", (e: InputEventNoteon) => {
                            activeMap.set(NewNote(e.note.name, e.note.octave), true)
                            activeMap = activeMap // trigger svelte update
                        });
                        WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
                            activeMap.set(NewNote(e.note.name, e.note.octave), false)
                            activeMap = activeMap // trigger svelte update
                        });
                        midiConnected = true
                    } catch (e) {
                        // TODO: handle disconnects too
                        setTimeout(addListeners, 200)
                    } 
                }
                addListeners()
            }
        });
    }
    onMount(() => {
        enableWebMidi()

        addGlobalKeyListener(true, (event) => {
            mobile = false
            setActive(event.keyCode, true)
        });
        
        addGlobalKeyListener(false, (event) => {
            mobile = false
            setActive(event.keyCode, false)
        });
    })

    // setup computer keyboard input
    function setActive(charCode: number, isActive: boolean) {
        let changedNote = keyboardInputNote(charCode, notes)
        if (changedNote != undefined) {
            activeMap.set(changedNote, isActive)
            activeMap = activeMap // trigger svelte update
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

    // TODO: surely make it more concise
    // TODO: use an enum for possible expectations of a note, and another for state of a key
    function getState(note: Note, activeMap: Map<Note, boolean>, lessonNotes: Map<Note, string>, occupation: occupationTracker) {
        let stateString = () => {
            if (sandbox) {
                return activeMap.get(note) ? "active" : ""
            } else {
                if (lessonNotes.has(note)) {
                    let val = lessonNotes.get(note)
                    if (val == "strict") {
                        return activeMap.get(note) && !occupation.occupiedPrevious(note) ? "right" : "wrong"
                    } else if (val.includes("soft")) {
                        return activeMap.get(note) && !occupation.occupiedPrevious(note) ? "right" : ""
                    } else if (val == "expecting") {
                        return activeMap.get(note) ? "right" : "expecting"
                    }
                    throw new Error("unexpected note state value " + val)
                } else {
                    return activeMap.get(note) ? "wrong" : ""
                }
             }
        }

        let ss = stateString()

        try {
            switch (ss) {
                case "right":
                    scorer.recordNoteState(note, state.valid, position)
                    break
                case "wrong":
                    scorer.recordNoteState(note, state.invalid, position)
                    break
                default:
                    scorer.recordNoteState(note, state.indifferent, position)
            }
        } catch(e) {

        }

        return ss
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

<div on:touchstart={()=>{mobile = true}}>
    <div class="rapper" id="LilPeep">
        {#each whiteWidths(notes.white()) as {note, width}}
            <Key width={width} {note} active={activeMap.get(note)} state={getState(note, activeMap, lessonNotes, occupation)} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key width={regularWhiteWidth(notes.white())*100} {note} active={activeMap.get(note)} state={getState(note, activeMap, lessonNotes, occupation)} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
            {/if}
        {/each}
    </div>
</div>