<script lang="ts">
import type { log } from 'console';

    import type { TimedNotes } from '../../lib/music/timed/timed'
    import Spotify from "../audioplayer/Spotify.svelte"
    import { playingStore } from "../../stores/stores"
    import { newPiano } from '../track/instrument';
    import UI from "../audioplayer/UI.svelte"
    import PianoRoll from "../pianoroll/PianoRoll.svelte";
import type { get } from 'http';
    import Dropdown from '../generic/dropdown/Dropdown.svelte';

    export let owner;
    export let lessonID;
    export let tracks: Map<string, TimedNotes>;
    export let bars;
    export let artist;
    export let spotify_id;
    export let gl:Boolean = false;
    // deprecated
    export let notes;

    let playing;
    playingStore.subscribe((val) => {
        playing = val;
    })

    console.log(tracks)

    let selectedNotes;
    if (notes !== undefined) {
        selectedNotes = notes
    } else {
        selectedNotes = tracks.get(tracks.keys().next())
    }

    $: hideTitle = playing && window.innerHeight <= 400

    function handleTrackSelection(e) {
        selectedNotes = e.detail
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

            .soloSettings {
                padding-top: 6px;
                padding-bottom: 4px;
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
        {#if !hideTitle}
            <div class="nav">
                <h1>{lessonID}</h1>
            </div>
        {/if}
        <div class="line2">
            {#if !hideTitle}
                <div class="subtitle">
                    <h3>{artist}</h3>
                </div>
                {#if notes === undefined}
                    <Dropdown list={tracks} on:select={handleTrackSelection}></Dropdown>
                {/if}
            {/if}
            <div class="settings {hideTitle ? "soloSettings": ""}">
                {#if spotify_id !== ""}
                    <Spotify track={spotify_id}></Spotify>
                {:else}
                    <UI></UI>
                {/if}
            </div>
        </div>
    </div>
    <div class="piano">
        <PianoRoll bars={bars} notes={selectedNotes} recordMode={false} instrument={newPiano("Lesson Playback")} {gl}></PianoRoll>
    </div>
</div>