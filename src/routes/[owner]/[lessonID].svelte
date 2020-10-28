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

    export let owner;
    export let lessonID;
</script>

<style lang="scss">
    $piano-height: 80vh;

    .page {
        display: flex;
        align-items: stretch;
        flex-direction: column;
        height: 100vh;
    }

    .optionwrapper {
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
        flex: 1;
        width: 100%;
    }

    h3 {
        color: grey;
    }
</style>

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <div class="page">
        <div class="optionwrapper">
            <div class="nav">
                <h1>{lessonID}</h1>
                <h3>{lesson.artist}</h3>
            </div>
            <div class="settings">
                <Spotify track={lesson.spotify_id}></Spotify>
            </div>
        </div>
        <div class="piano">
            <PianoRoll bars={castBars(lesson.bars)} notes={castTimedNotes(lesson.notes)} recordMode={false}></PianoRoll>
        </div>
    </div>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}