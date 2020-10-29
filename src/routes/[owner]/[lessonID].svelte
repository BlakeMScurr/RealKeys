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
    $margins: 1.5em;

    .page {
        display: flex;
        align-items: stretch;
        flex-direction: column;
        height: 100vh;
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

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <div class="page">
        <div class="optionwrapper">
            <div class="nav">
                <h1>{lessonID}</h1>
            </div>
            <div class="line2">
                <div class="subtitle">
                    <h3>{lesson.artist}</h3>
                </div>
                <div class="settings">
                    <Spotify track={lesson.spotify_id}></Spotify>
                </div>
            </div>
        </div>
        <div class="piano">
            <PianoRoll bars={castBars(lesson.bars)} notes={castTimedNotes(lesson.notes)} recordMode={false}></PianoRoll>
        </div>
    </div>
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {console.log(error)}</h1>
{/await}