<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import { castTimedNotes } from '../../lib/cast.ts'
    import { getLessonDefinition } from '../../lib/api.js'
    import { NewYouTubeAudioPlayer } from "../../components/audioplayer/audioplayer.ts"
    import AudioPlayer from "../../components/audioplayer/AudioPlayer.svelte"
    import PianoRoll from "../../components/pianoroll/PianoRoll.svelte";

    export let owner;
    export let lessonID;
</script>


{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <h1>{lessonID}</h1>
    <h3>{owner}</h3>
    <AudioPlayer AudioPlayerPromise={NewYouTubeAudioPlayer(lesson.youtube_id)}></AudioPlayer>
    <PianoRoll bars={lesson.bars} notes={castTimedNotes(lesson.notes)}></PianoRoll>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}