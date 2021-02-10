<script lang="ts">
    import { stores } from "@sapper/app";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import { handDesc, makeHand, makeSpeed, taskSpec, urlToTask } from "../lib/lesson/lesson";

    const { page } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    const heading = task.score === 100 ? "Congratulations!" : "Almost there!"
    const paragraph = task.score === 100 ? `You learned ${handDesc(task.hand)} of bars ${task.startBar}-${task.endBar}` : undefined
</script>

<style lang="scss">
    h4 {
        text-align: center;
        margin-top: 0;
    }

    .holder {
        padding: 0px 30px 30px 30px;
        display: flex;
        flex-direction: column;

        div {
            margin: 60px 0 0 0;
            align-self: center;
            div {
                display: inline-block;
            }
        }
    }
</style>

<div class="holder">
    <h2>{heading}</h2>
    {#if paragraph}
        <h4>{paragraph}</h4>
    {/if}
    <div>
        <ScoreBar value={task.score} showValue={true} size={"medium"}></ScoreBar>
    </div>
    <div>
        <OptionButton text="Select Level"></OptionButton>
        <ReccomendedButton text="Next Level"></ReccomendedButton>
    </div>
</div>