<script lang="ts">
    import DOMRoll from "../components/pianoroll/roll/DOMRoll.svelte";
    import type { TimedNotes } from "../lib/music/timed/timed";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import type { Colourer } from '../components/colours';
    import type { scorer, timedScoreKeeper } from "../lib/gameplay/score/score";

    export let tracks: Map<string, TimedNotes>;
    export let colourer: Colourer;
    export let duration: number;
    export let position: number;
    export let scorer: scorer;
    export let keys;

    let score = 0
    scorer.subscribe((s)=>{
        score = s
    })

    let roll;
</script>

<style lang="scss">
    .parent {
        position: relative;
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
            height: 5%;

            div {
                height: 100%;
                width: 20%;
                margin-right: 15px;
            }
        }

        .roll {
            flex-grow: 1;
            position: relative;
        }
    }

</style>

<!-- TODO: consider adding a loading icon here, if the midi doesn't load fully on the rules screen -->
<div class="parent">
    <div class="score">
        <div>
            <ScoreBar size={"flex"} showValue={false} value={ score*100 }></ScoreBar>
        </div>
    </div>
    <div class="roll" bind:this={roll}>
        <DOMRoll {keys} {tracks} {colourer} {duration} {position} heightElement={roll}></DOMRoll>
    </div>
</div>