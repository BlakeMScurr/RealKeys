<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { NewNote, Line, parseNoteString } from "../../../lib/music/theory/notes";
    import type { Note} from "../../../lib/music/theory/notes";
    import { blackAndGhostBetween, Ghost, whiteWidths, regularWhiteWidth, keyboardInputNote, label, occupationTracker } from "./pianoHelpers";
    import WebMidi, { InputEventNoteon, InputEventNoteoff } from "webmidi";
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

    export let expectedNotes = new Map<string, string>(); // TODO: remove expectedNotes and just use lessonNotes instead, as it's better to have notes typed
    $: {
        if (lessonNotes) {
            let newExpectedNotes = new Map<string, string>();
            lessonNotes.forEach((state, note) => {
                newExpectedNotes.set(note.string(), state)
            })
            expectedNotes = newExpectedNotes
        }
    }


    let midiConnected = false
    let mobile = false // TODO: figure out how to know this before we get any events
    usedNotes = new Map(); // TODO: use this when a setting enables it
    let un = new Map();
    $: labelsOn = !midiConnected && !mobile && false // TODO: use this when a setting enables it
    $: labels = labelsOn ? label(new Line(keys)) : new Map();

    // If a new note arrives, and the current depression of its key was due to a previous note, then the note should be invalid
    // Played map records whether a given note has been played yet
    let occupation: occupationTracker = new occupationTracker();

    let previousStates = new Map<string, string>();
    $: {
        let newPreviousStates = new Map<string, string>();
        if (lessonNotes) {
            lessonNotes.forEach((value, note) => {
                if (value === "softstart") {
                    if (!previousStates.has(note.string())) {
                        occupation.expect(note)
                    } else {
                        if (previousStates.get(note.string()) !== "softstart") {
                            occupation.unexpect(note)
                            occupation.expect(note)
                        }
                    }
                }
                newPreviousStates.set(note.string(), value)
            })
        }

        previousStates.forEach((value, noteStr) => {
            if (!newPreviousStates.has(noteStr)) {
                occupation.unexpect(parseNoteString(noteStr))
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

        console.log("getting note event")
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
                            activeMap.set(NewNote(e.note.name, e.note.getOctave()), true)
                            activeMap = activeMap // trigger svelte update
                        });
                        WebMidi.inputs[0].addListener('noteoff', "all", (e: InputEventNoteoff) => {
                            activeMap.set(NewNote(e.note.name, e.note.getOctave()), false)
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
            console.log("changing note due to keyboard input", changedNote, isActive)
            activeMap.set(changedNote, isActive)
            activeMap = activeMap // trigger svelte update
        } else {
            console.log("undefined keyboard input")
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
    function getState(note: Note, am: Map<Note, boolean>, expectedNotes, occupation: occupationTracker) {
        let stateString = () => {
            let str = note.string()
            let activeMap = new Map<string, boolean>();
            am.forEach((bool, n) => {
                activeMap.set(n.string(), bool)
            })

            if (sandbox) {
                return activeMap.get(str) ? "active" : ""
            } else {
                if (expectedNotes.has(str)) {
                    let val = expectedNotes.get(str)
                    if (val == "strict") {
                        return activeMap.get(str) && !occupation.occupiedPrevious(note) ? "right" : "wrong"
                    } else if (val.includes("soft")) {
                        return activeMap.get(str) && !occupation.occupiedPrevious(note) ? "right" : ""
                    } else if (val == "expecting") {
                        return activeMap.get(str) ? "right" : "expecting"
                    }
                    throw new Error("unexpected note state value " + val)
                } else {
                    return activeMap.get(str) ? "wrong" : ""
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
            <Key width={width} {note} active={activeMap.get(note)} state={getState(note, activeMap, expectedNotes, occupation)} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
        {/each}
    </div>
    <div style="--blackMargin: {regularWhiteWidth(notes.white())*100/4}%;" class="rapper" id="JuiceWrld">
        {#each blackAndGhostBetween(notes.lowest(), notes.highest()) as note}
            {#if note instanceof Ghost}
                <Key ghost={true} width={regularWhiteWidth(notes.white())*100 * (2/4)}></Key>
            {:else}
                <Key width={regularWhiteWidth(notes.white())*100} {note} active={activeMap.get(note)} state={getState(note, activeMap, expectedNotes, occupation)} on:noteOn={forward} on:noteOff={forward} label={getLabel(labels, note)} used={un.has(note.string())}></Key>
            {/if}
        {/each}
    </div>
</div>