<script lang="ts">
    import type { GameMaster } from "../../stores/stores"
    import UI from "../audioplayer/UI.svelte"
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import Dropdown from '../dropdown/Dropdown.svelte';
    import type { InertTrack } from '../../lib/track/instrument';
    import { arraysEqual, get } from '../../lib/util';
    import { TimedNotes } from '../../lib/music/timed/timed';
    import { makeClicks } from "./clickTrack";
    import type { Colourer } from "../colours";
    import { writable } from 'svelte/store';
    import Slider from "../slider/Slider.svelte";
    // import Search from "../generic/Search.svelte";

    export let owner;
    export let lessonID;
    export let inertTracks: Map<string, InertTrack>;
    export let bars;
    export let timesignatures;
    export let gm: GameMaster;
    export let colourer: Colourer;
    // This is a horrible hack to pass in a lesson loader from above, as the above component used to be where we'd have the lesson selection logic
    // TODO: combine them as there's no point in decoupling the logic anymore, and the UI and logic is much cleaner here
    export let loadNew;
    export let loadLocal;
    export let piano;

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

    let trackList = Array.from(inertTracks.keys())
    const allTracks = "All Tracks"
    trackList.unshift(allTracks)
    // TODO: make dropdown accept list, not just map
    let trackMap = new Map()
    trackList.forEach((track) => {
        trackMap.set(track, true)
    })
    
    let currentTracks = trackList.slice(1)
    gm.tracks.enable(addClick(currentTracks));
    let unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
    let selectedNotes = gm.tracks.notes(currentTracks);

    const outsideTrackSelector = writable(0);
    function handleRollTrackSelection(e) {
        outsideTrackSelector.set(e.detail + 1)
    }

    function handleTrackSelection(e) {
        if (e.detail.key === allTracks) {
            currentTracks = trackList.slice(1)
        } else {
            currentTracks = [e.detail.key]
        }
        gm.tracks.enable(addClick(currentTracks));
        unsub()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
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

    $: {
        let _ = clickTrackOn
        clickTrackChange()
    }

    function clickTrackChange() {
        gm.tracks.enable(addClick(currentTracks));
        unsub()
        unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
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
            unsubscribe = gm.tracks.subscribeToNotesOfTracks(currentTracks, onNoteStateChange)
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

    function activeTrack(sn: Map<string, TimedNotes>):TimedNotes  {
        let t;
        Array.from(sn.values()).forEach((track)=>{
            if (track.notes.length !== 0) {
                t = track
            }
        })
        return t || new TimedNotes([])
    }

    function nextWaitModeNote() {
        let nextNotes = activeTrack(selectedNotes).notesFrom(get(gm.position), 1)
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


    let speed: number = 1
    $: {
        gm.speedStore.set(speed)
    }

    let playAlongMode = "Play Along Mode"
    // TODO: show descriptions in the dropdown
    let modeList = new Map([
        [playAlongMode, "Play notes as they come"],
        ["Wait Mode", "Playback waits until you play the next note"],
    ])

    function handleModeSelect(e) {
        gm.waitMode.set(e.detail.key !== playAlongMode)
    }

    
    const outsideWMSelector = writable(0);
    gm.waitMode.subscribe((wm) => {
        outsideWMSelector.set(wm?1:0)
    })

    let uploader
    function handleUploadSelection () {
        console.log(uploader, uploader.files)
        if (uploader.files.length === 1) {
            loadLocal(uploader.files[0])
        } else {
            console.warn(`uploaded ${uploader.files.length} files, expected 1`)
        }
    }
</script>

<style lang="scss">
    $piano-height: 80vh;
    $margins: 1.5em;
    $little-margins: 0.5em;

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
            padding-left: $margins;
            flex-wrap: wrap;

            .upload {
                margin-left: $little-margins;
            }
            .settings {
                padding-right: $margins;
                margin-left: auto;
                display: flex;
                align-items: center;
                flex-wrap: wrap;

                div {
                    margin-right: $little-margins;
                }
                .thin {
                    padding-top: $margins / 2;
                    padding-bottom: $margins / 2;
                }
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

    .slider {
        max-width: 100px;
        p {
            margin: 0;
        }
    }
</style>

<div class="page">
    <div class="optionwrapper">
        <div class="nav">
            <h1>{lessonID}</h1>
        </div>
        <div class="line2">
            <!-- <Search loadNew={loadNew}></Search> -->

            <!-- TODO: put the upload and settings components in the same flex box but justify them left or right using https://stackoverflow.com/a/34063808 -->
            <div class="upload">
                <button>
                    <label for="files" class="btn">Upload MIDI</label>
                </button>
                <input id="files" style="display:none;" type="file" on:change={handleUploadSelection} bind:this={uploader}>
            </div>
            
            <!-- TODO: only pass the keys into the dropdown -->
            <div class="settings">
                <div class="thin"><Dropdown list={trackMap} outsideSelector={outsideTrackSelector.subscribe} on:select={handleTrackSelection}></Dropdown></div>
                <div class="thin"><Dropdown list={modeList} outsideSelector={outsideWMSelector.subscribe} on:select={handleModeSelect}></Dropdown></div>
                <div class="slider">
                    <p>Speed {Math.round(speed * 100)}%</p>
                    <Slider min={0.1} max={1} step={0.01} bind:value={speed}></Slider>
                </div>
                <UI {gm}></UI>
            </div>

        </div>
    </div>
    <div class="piano">
        <!-- TODO: allow multiple notes in the pianoroll -->
        <PianoRoll bars={bars} {colourer} {state} on:playingNotes={handlePlayingNotes} tracks={selectedNotes} notes={activeTrack(selectedNotes)} {gm} on:selectTrack={handleRollTrackSelection} {piano}></PianoRoll>
    </div>
</div>

<!-- TODO: add in again once the click sounds good again -->