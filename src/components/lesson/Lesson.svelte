<script lang="ts">
    import type { GameMaster } from "../../stores/stores"
    import UI from "../audioplayer/UI.svelte"
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import Settings from "../settings/Settings.svelte";
    import Dropdown from '../dropdown/Dropdown.svelte';
    import type { InertTrack } from '../../lib/track/instrument';
    import { arraysEqual, get } from '../../lib/util';
    import type { TimedNote } from '../../lib/music/timed/timed';
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
    let unsubscribe = gm.tracks.subscribeToNotesOfTracks([currentTracks[0]], onNoteStateChange)
    let selectedNotes = gm.tracks.notes(currentTracks);

    let trackList = Array.from(inertTracks.keys())
    trackList.unshift("All")
    // TODO: make dropdown accept list, not just map
    let trackMap = new Map()
    trackList.forEach((track) => {
        trackMap.set(track, true)
    })

    function handleTrackSelection(e) {
        if (e.detail.key === "All") {
            currentTracks = trackList.slice(1)
        } else {
            currentTracks = [e.detail.key]
        }
        gm.tracks.enable(addClick(currentTracks));
        unsub()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks([currentTracks[0]], onNoteStateChange)
        selectedNotes = gm.tracks.notes(currentTracks);
        if (get(gm.waitMode)) {
            state = new Map<string, string>();
            nextWaitModeNote().sameStart.forEach(note => {
                state.set(note.note.string(), "expecting")
            })
            state = state
        }
    }

    function addClick(currentTracks) {
        let fullTracks = JSON.parse(JSON.stringify(currentTracks))
        if (clickTrackOn) fullTracks.push("clickTrack")
        return fullTracks
    }

    function clickTrackChange() {
        gm.tracks.enable(addClick(currentTracks));
        unsub()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks([currentTracks[0]], onNoteStateChange)
        selectedNotes = gm.tracks.notes(currentTracks);
    }

    gm.waitMode.subscribe((waitModeOn) => {
        if (waitModeOn) {
            unsub()
            state = new Map<string, string>();
            nextWaitModeNote().sameStart.forEach(note => {
                state.set(note.note.string(), "expecting")
            })
            state = state
        } else {
            unsubscribe = gm.tracks.subscribeToNotesOfTracks([currentTracks[0]], onNoteStateChange)
        }
    })

    gm.seek.subscribe(() => {
        if (get(gm.waitMode)) {
            state = new Map<string, string>();
            nextWaitModeNote().sameStart.forEach(note => {
                state.set(note.note.string(), "expecting")
            })
            state = state
        }
    })

    function nextWaitModeNote() {
        let nextNotes: Array<TimedNote> = Array.from(selectedNotes.values())[0].notesFrom(get(gm.position), 1)
        let i = 0
        let sameStart = []
        while (i < nextNotes.length && nextNotes[i].start == nextNotes[0].start) {
            sameStart.push(nextNotes[i])
            i++
        }

        let next = undefined;
        if (i < nextNotes.length) {
            next = nextNotes[i]
        }

        return { sameStart: sameStart, next: next }
    }

    // Handle wait mode
    function handlePlayingNotes(event) {
        // TODO: handle chords.
        // i.e., you must have all the relevant notes at the same time before we move on
        // handle edge cases like if one note is held over, or there's a tiny epsilon discrepency between notes
        if (get(gm.waitMode)) {
            let nextNotes = nextWaitModeNote()
            if (nextNotes.sameStart.length >= 1) {
                let currentlyPlaing = event.detail.sort()
                let shouldPlay = nextNotes.sameStart.map((note) => { return note.note.string() }).sort()

                if (arraysEqual(currentlyPlaing, shouldPlay)) {
                    if (nextNotes.next) {
                        nextNotes.sameStart.forEach((note) => {
                            setTimeout(()=> {
                                state.delete(note.note.string())
                                state = state
                            }, (note.end - get(gm.position)) * get(gm.songDuration))
                        })

                        // we have to set the deletion timeouts before seeking, as when there are two directly adjacent notes of the same pitch, there is
                        // a race condiion between the timeout deleting the previous one from the state map, and the seek listener which sets the next one.
                        // The seek listener depends directly on seek.setSlow, and it needs to happen second, so we run seek.setSlow second
                        // TODO: find a solution that can provide strict certainty about time.
                        gm.seek.setSlow(nextNotes.next.start)
                        shouldPlay.forEach((noteName) => {
                            state.set(noteName, "soft")
                        })
                        state = state
                    }
                }
            }
        }
    }

    // We are getting from svelte's unsubscribe method saying "stop is not a function", which really don't make an awful lot of sense
    // TODO: investigate deeply and get rid of this.
    function unsub() {
        try {
            unsubscribe()
        } catch (e) {
            console.warn(e)
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
            <Dropdown list={trackMap} on:select={handleTrackSelection}></Dropdown>
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
        <PianoRoll bars={bars} {state} on:playingNotes={handlePlayingNotes} tracks={selectedNotes} {gm}></PianoRoll>
    </div>
</div>