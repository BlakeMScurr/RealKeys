<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import { castTimedNotes, castBars } from '../../lib/cast.ts'
    import { getLessonDefinition } from '../../lib/api.js'
    import Spotify from "../../components/audioplayer/Spotify.svelte"
    import PianoRoll from "../../components/pianoroll/PianoRoll.svelte";
    import { playingStore } from "../../stores/stores"
    import { newPiano } from '../../components/track/instrument';
    import Lesson from "../../components/lesson/Lesson.svelte"

    export let owner;
    export let lessonID;
</script>

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <Lesson owner={owner} lessonID={lessonID} notes={castTimedNotes(lesson.notes)} bars={castBars(lesson.bars)} artist={lesson.artist} spotify_id={lesson.spotify_id}></Lesson>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}