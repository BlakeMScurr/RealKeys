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
    import { NewYouTubeAudioPlayer } from "../../components/audioplayer/audioplayer.ts"
    import AudioPlayer from "../../components/audioplayer/AudioPlayer.svelte"
    import PianoRoll from "../../components/pianoroll/PianoRoll.svelte";
    import ZoomBars from '../../components/bars/zoom/ZoomBars.svelte';

    export let owner;
    export let lessonID;
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
        <AudioPlayer AudioPlayerPromise={NewYouTubeAudioPlayer(lesson.youtube_id)}></AudioPlayer>
        <ZoomBars bars={lesson.bars}></ZoomBars>
    </div>
    <PianoRoll bars={castBars(lesson.bars)} notes={castTimedNotes(lesson.notes)} recordMode={false}></PianoRoll>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}