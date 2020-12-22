<script lang="ts">
    import type { GameMaster } from "../../stores/stores"
    import UI from "../audioplayer/UI.svelte"
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import Settings from "../settings/Settings.svelte";
    import Dropdown from '../dropdown/Dropdown.svelte';
    import type { InertTrack } from '../../lib/track/instrument';
    import { get } from '../../lib/util';
    import { makeClicks } from "./clickTrack";

    export let owner;
    export let lessonID;
    export let inertTracks: Map<string, InertTrack>;
    export let bars;
    export let timesignatures;
    export let gm: GameMaster;

    // Handle note state subscription
    let state = new Map<string, string>();
    function onNoteStateChange(notes: Map<string, string>) {
        state = new Map<string, string>();
        notes.forEach((noteState, noteName: string)=>{
            state.set(noteName, noteState)
        })
        state = state
    }

    // make tracks
    inertTracks.forEach((track, name) => {
        gm.tracks.newPlaybackTrack(name, track.notes, track.instrument, gm)
    })
    makeClicks(bars.bars, timesignatures, gm)

    // handle reactivity and track selection
    let clickTrackOn = false;

    let currentTracks = [inertTracks.keys().next().value]
    gm.tracks.enable(addClick(currentTracks));
    let unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
    let selectedNotes = gm.tracks.notes(currentTracks);


    function handleTrackSelection(e) {
        currentTracks = [e.detail.key]
        gm.tracks.enable(addClick(currentTracks));
        unsubscribe()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
        selectedNotes = gm.tracks.notes(currentTracks);
    }

    function addClick(currentTracks) {
        let fullTracks = JSON.parse(JSON.stringify(currentTracks))
        if (clickTrackOn) fullTracks.push("clickTrack")
        return fullTracks
    }

    function clickTrackChange() {
        gm.tracks.enable(addClick(currentTracks));
        unsubscribe()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
        selectedNotes = gm.tracks.notes(currentTracks);
    }

    gm.waitMode.subscribe((waitModeOn) => {
        if (waitModeOn) {
            unsubscribe()
            state = new Map<string, string>();
        } else {
            unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
        }
    })

    // Handle wait mode
    function handleNoteOn(event) {
        // TODO: handle chords.
        // i.e., you must have all the relevant notes at the same time before we move on
        // handle edge cases like if one note is held over, or there's a tiny epsilon discrepency between notes
        if (get(gm.waitMode)) {
            let nextNotes = Array.from(selectedNotes.values())[0].notesFrom(get(gm.position), 1)
            if (nextNotes.length >= 1) {
                let note = event.detail
                if (nextNotes[0].note.equals(note)) {
                    if (nextNotes.length >= 2) {
                        gm.seek.setSlow(nextNotes[1].start)
                        state.set(note.string(), "soft")
                        state = state
                        setTimeout(()=> {
                            state.delete(note.string())
                            state = state
                        }, (nextNotes[0].end - get(gm.position)) * get(gm.songDuration))
                    }
                }
            }
        }
    }

</script>

<style lang="scss">
    $piano-height: 80vh;
    $margins: 1.5em;

    .page {
        display: flex;
        align-items: stretch;
        flex-direction: column;
        height: 100vh;
        touch-action: manipulation; // disable double click zoom per https://stackoverflow.com/a/53236027
    }

    .optionwrapper {
        width: 100%;
        display: flex;
        flex-flow: column;

        button {
            display: inline-block;
        }

        div {
            display: inline-block;
            margin: none;
        }

        h1 {
            margin-bottom: 0;
        }

        .nav {
            width: calc(100% - 2 * #{$margins});
            padding-left: $margins;
            padding-right: $margins;
        }

        .line2 {
            display: flex;
            align-items: center;

            .subtitle {
                padding-left: $margins;
            }

            .settings {
                padding-right: $margins;
                margin-left: auto;
            }
        }
    }

    .piano {
        flex: 1;
        width: 100%;
    }

    h3 {
        color: grey;
    }
</style>

<div class="page">
    <div class="optionwrapper">
        <div class="nav">
            <h1>{lessonID}</h1>
        </div>
        <div class="line2">
            <!-- TODO: only pass the keys into the dropdown -->
            <Dropdown list={inertTracks} on:select={handleTrackSelection}></Dropdown>
            <label for="clickTrackOn">Click Track</label>
            <input type="checkbox" id="clickTrackOn" bind:checked={clickTrackOn} on:change={clickTrackChange}>
            <Settings bars={bars} timesignatures={timesignatures} {gm}></Settings>
            <div class="settings">
                <UI {gm}></UI>
            </div>
        </div>
    </div>
    <div class="piano">
        <!-- TODO: allow multiple notes in the pianoroll -->
        <PianoRoll bars={bars} {state} on:noteOn={handleNoteOn} notes={Array.from(selectedNotes.values())[0]} {gm}></PianoRoll>
    </div>
</div>