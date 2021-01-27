<script lang="ts">
    import { lessons } from "../lib/lesson/data";
    import { taskSpec } from "../lib/lesson/lesson";
    import { NewNote, notesBetween } from "../lib/music/theory/notes";
    import DOMRoll from "../components/pianoroll/roll/DOMRoll.svelte";
    import type { TimedNotes } from "../lib/music/timed/timed";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import type { Colourer } from '../components/colours';

    export let task: taskSpec;
    export let tracks: Map<string, TimedNotes>;
    export let colourer: Colourer;
    export let duration: number;

    if (!lessons.has(task.lesson)) {
        throw new Error(`No lesson called ${task.lesson}`)
    }

    let keys = notesBetween(NewNote("C", 4), NewNote("C", 5))
    let value = 56
</script>

<style lang="scss">
    .parent {
        height: 100%;
        display: flex;
        flex-direction: column;

        .score {
            margin: 15px 0 15px 0;
            z-index: 3;
            display: flex;
            justify-content: flex-end;
            flex-grow: 0;
            position: absolute;
            width: 100%;
            height: 3%;

            div {
                height: 100%;
                width: 20%;
                margin-right: 15px;
            }
        }

        .roll {
            flex-grow: 1;
        }

    }
</style>

<!-- TODO: consider adding a loading icon here, if the midi doesn't load fully on the rules screen -->
<div class="parent">
    <div class="score">
        <div>
            <ScoreBar size={"flex"} showValue={false} value={value}></ScoreBar>
        </div>
    </div>
    <div class="roll">
        <DOMRoll {keys} {tracks} {colourer} {duration}></DOMRoll>
    </div>
</div>
