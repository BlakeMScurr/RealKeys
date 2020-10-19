<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { currentSong } from "../../../stores/stores";
    import type { TimedNotes } from '../../../lib/music/timed/timed';
    import { getLessonDefinition } from '../../../lib/api.js'
    import { joinURL } from '../../../lib/util';
    import { castBars, castTimedNotes } from '../../../lib/cast';

    import PianoRoll from "../../../components/pianoroll/PianoRoll.svelte";
    import ZoomBars from "../../../components/bars/zoom/ZoomBars.svelte";
    import Spotify from "../../../components/audioplayer/Spotify.svelte";

    export let owner;
    export let lessonID;

    onMount(()=>{
        let loads = 0;
        currentSong.subscribe((notes: TimedNotes) => {
            // Don't update the notes in the db for the initial value of the store
            if (loads > 0) {
                fetch(joinURL(["api", owner, lessonID, "updateNotes"]), {
                    method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(notes)
                })
            }
            loads++
        })
    })
</script>

<style lang="scss">
    $piano-height: 80vh;

    .optionwrapper {
        height: 100vh - $piano-height;
        width: 100%;

        div {
            display: inline-block;
            margin: none;
        }

        // TODO: why doesn't it work when we have the two add to 100%?
        .nav {
            width: calc(69% - 2em);
            padding-left: 2em;
        }

        .settings {
            width: calc(29% - 2em);
            padding-right: 2em;
        }
    }

    .piano {
        height: $piano-height;
    }
</style>

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <div class="optionwrapper">
        <div class="nav">
            <h1>{lessonID}</h1>
            <h3>{owner}</h3>
        </div>
        <div class="settings">
            <Spotify track={lesson.spotify_id}></Spotify>
        </div>
    </div>
    <div class="piano">
        <PianoRoll bars={castBars(lesson.bars)} notes={castTimedNotes(lesson.notes)} recordMode={true}></PianoRoll>
    </div>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}