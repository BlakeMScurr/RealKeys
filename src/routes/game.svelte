<script lang="ts">
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
    import Piano from "../components/pianoroll/piano/Piano.svelte";
    import { lessons } from "../lib/lesson/data";
    import { urlToTask } from "../lib/lesson/lesson";
    import { NewNote, notesBetween } from "../lib/music/theory/notes";
    import { newPiano } from "../lib/track/instrument";
    import Loader from "../components/loader/Loader.svelte"
    import DOMRoll from "../components/pianoroll/roll/DOMRoll.svelte";
    import type { TimedNotes } from "../lib/music/timed/timed";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import { getMIDI } from "../lib/midi"
    import { Colourer } from '../components/colours';

    const { page } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    if (!lessons.has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    // required as trying to creating instruments requires window.AudioContext, and errors in preprocessing on the server
    let piano
    let loading = true
    onMount(() => {
        piano = newPiano("User Piano", ()=>{loading = false})
    })

    let keys = notesBetween(NewNote("C", 4), NewNote("C", 5))
    let tracks = new Map<string, TimedNotes>();
    let colourer = new Colourer(3)
    let value = 56

    getMIDI("api/midi?path=%2FClassical_mfiles.co.uk_MIDIRip%2Ftwinkle-twinkle-little-star.mid").then((midi)=>{
        tracks = midi.tracks
        colourer = new Colourer(tracks.size)
    })
</script>

<style lang="scss">

    .parent {
        height: calc(100% - 50px); // whole page - nav
        display: flex;
        flex-direction: column;

        div {
            align-self: center;
            width: 100%;
            flex: 1 1 auto;
            position: relative;
        }

        .score {
            margin: 30px 0 15px 0;
            z-index: 3;
            display: flex;
            justify-content: center;
            flex-grow: 0;
        }

        .roll {
            flex-grow: 2;
        }

        .piano {
            flex-grow: 1;
        }
    }

    .loading {
        position: absolute;
        z-index: 15;
        height: 0;
        top: calc(50% - 75px); // centred, given ~150 width loading icon
        left: calc(50% - 75px);
    }

</style>

<div class="parent">
    <div class="score">
        <ScoreBar size={"large"} showValue={false} value={value}></ScoreBar>
    </div>
    <div class="roll">
        <DOMRoll {keys} {tracks} {colourer}></DOMRoll>
    </div>
    <div class="piano">
        <Piano {keys} sandbox={true} instrument={piano}></Piano>
        {#if loading}
            <div class="loading">
                <Loader></Loader>
            </div>
        {/if}
    </div>
</div>
