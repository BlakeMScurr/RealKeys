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
<style>
    .optionwrapper {
        position: relative;
        max-width: 56em;
        background-color: white;
        padding: 2em;
        margin: 0 auto;
        box-sizing: border-box;
    }
</style>
    
{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <div class="optionwrapper">
        <h1>{lessonID}</h1>
        <h3>{owner}</h3>
        <Spotify track={lesson.spotify_id}></Spotify>
        <ZoomBars bars={lesson.bars}></ZoomBars>
    </div>
    <PianoRoll bars={castBars(lesson.bars)} notes={castTimedNotes(lesson.notes)} recordMode={true}></PianoRoll>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}