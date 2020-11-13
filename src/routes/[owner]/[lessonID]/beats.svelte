<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import EditBars from '../../../components/bars/edit/EditBars.svelte';
    import { castBars } from '../../../lib/cast';
    import type { Bar } from "../../../components/bars/bars";
    import { getLessonDefinition } from '../../../lib/api.js';
    import Spotify from '../../../components/audioplayer/Spotify.svelte';
    import Settings from '../../../components/settings/Settings.svelte';
    import PianoRoll from '../../../components/pianoroll/PianoRoll.svelte';
    import { NewNote } from "../../../lib/music/theory/notes"
    import { TimedNote, TimedNotes } from "../../../lib/music/timed/timed";
    import { songDuration } from '../../../stores/stores';
    import { lowClick, newClicker } from "../../../components/track/clicker"

    export let owner;
    export let lessonID;

    let newBars
    function handleNewBars(event) {
        newBars = event.detail
    }

    function save(lesson) {
        return function () {
            lesson.bars = newBars
            lesson.lesson_name = owner + "/" + lessonID

            fetch(["api", owner, lessonID, "save"].join("/"), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(lesson),
            }).then(()=>{
                // TODO: show on the UI somewhere
                console.log("saved")
            }).catch((err)=>{
                console.log("failed to save:", err)
            })

            newBars = undefined
        }
    }

    let duration;
    songDuration.subscribe(val => {
        duration = val
    })

    function makeClicks(bars: Array<Bar>):Array<TimedNote> {
        let currPos = 0;
        return bars.map((bar) => {
            let oldPos = currPos
            currPos += bar.width
            return new TimedNote(oldPos, (oldPos + currPos) / 2, lowClick)
        })
    }

    // required because getting the clicker immediately at the top level gives a weird "AudioBuffer is not defined" error, there are probably many other possible workarounds
    // TODO: get rid of it
    async function makeClicker() {
        return newClicker("Click Track")
    }
</script>

<style lang="scss">
    .pianoHolder {
        display: flex;
        align-items: stretch;
        flex-direction: column;
        height: 80vh;
        touch-action: manipulation; // disable double click zoom per https://stackoverflow.com/a/53236027

        div {
            flex: 1;
            width: 100%;
        }
    }
</style>

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}

    {#await makeClicker()}
        <h1>Loading</h1>
    {:then clicker}
        <h1>{lessonID}</h1>
        <h3>{owner}</h3>

        <Settings clicks={makeClicks(newBars === undefined ? lesson.bars : newBars)} clicker={clicker}></Settings>
        <Spotify track={lesson.spotify_id}></Spotify>
        <EditBars bars={lesson.bars} on:newBars={handleNewBars}></EditBars>
        <button disabled={newBars === undefined} on:click={save(lesson)}>Save</button>
        <div class="pianoHolder">
            <div>
                <PianoRoll bars={castBars(newBars === undefined ? lesson.bars : newBars)} notes={new TimedNotes(makeClicks(newBars === undefined ? lesson.bars : newBars))} recordMode={true} instrument={clicker}></PianoRoll>
            </div>
        </div>
    {:catch error}
        <h1>Could not make clicker {error}</h1>
    {/await}
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {error}</h1>
{/await}