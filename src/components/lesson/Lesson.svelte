<script lang="ts">
    import { playingStore, tracks } from "../../stores/stores"
    import UI from "../audioplayer/UI.svelte"
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
    import Settings from "../settings/Settings.svelte";
    import Dropdown from '../dropdown/Dropdown.svelte';
    import type { InertTrack } from '../../lib/track/instrument';

    export let owner;
    export let lessonID;
    export let inertTracks: Map<string, InertTrack>;
    export let bars;
    export let timesignatures;

    let playing;
    playingStore.subscribe((val) => {
        playing = val;
    })

    tracks.enable(inertTracks.keys().next().value);
    let selectedNotes = tracks.enabledNotes();

    function handleTrackSelection(e) {
        tracks.enable(e.detail.key);
        selectedNotes = tracks.enabledNotes();
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
            <Dropdown list={tracks} on:select={handleTrackSelection}></Dropdown>
            <Settings bars={bars} timesignatures={timesignatures}></Settings>
            <div class="settings">
                <UI></UI>
            </div>
        </div>
    </div>
    <div class="piano">
        <PianoRoll bars={bars} notes={selectedNotes}></PianoRoll>
    </div>
</div>