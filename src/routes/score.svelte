<script lang="ts">
    import { goto, stores } from "@sapper/app";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import type { lessonSet } from "../lib/lesson/data";
    import { handDesc, taskSpec, urlToTask } from "../lib/lesson/lesson";
    import { levels, nextLevel, replay } from "../lib/lesson/navigate";
    import { get } from "../lib/util";

    const { page, session } = stores();
    const query = $page.query;
    let task: taskSpec = urlToTask(query)

    // TODO: make sure this is valid regardless of how one gets to this page. Currently refresh kills the session and makes the next leve button unusable
    let lessons = get(session)

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
        {#if task.score < 100}
            <OptionButton text="Select Level" on:click={()=>{goto(levels(task), {replaceState: true})}}></OptionButton>
            <ReccomendedButton text="Retry" on:click={()=>{goto(replay(task), {replaceState: true})}}></ReccomendedButton>
        {:else}
            <OptionButton text="Select Level" on:click={()=>{goto(levels(task), {replaceState: true})}}></OptionButton>
            <ReccomendedButton text="Next Level" on:click={()=>{goto(nextLevel(task, lessons), {replaceState: true})}}></ReccomendedButton>
        {/if}
    </div>
</div>