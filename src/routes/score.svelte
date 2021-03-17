<script lang="ts">
    import { goto, stores } from "@sapper/app";
    import { onMount } from "svelte";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import type { Curriculum } from "../lib/gameplay/curriculum/curriculum";
    import { defaultLessons } from "../lib/gameplay/curriculum/data";
    import { urlToTask } from "../lib/gameplay/curriculum/task";
    import { getProgress } from "../lib/storage";
    import { get } from "../lib/util";

    const { page, session } = stores();
    const query = $page.query;
    let task = urlToTask(query)

    let score = parseInt(query.score)
    let progress: Curriculum;
    
    onMount(()=>{
        progress = getProgress(defaultLessons())
    })

    // TODO: make sure this is valid regardless of how one gets to this page. Currently refresh kills the session and makes the next leve button unusable
    let lessons = get(session)

    $: heading = score === 100 ? "Congratulations!" : "Almost there!"
    let paragraph;
    $: {
        if (progress && progress.next((t)=>{ return t.getLessonURL() === task.getLessonURL() }) === null) {
            paragraph = `You learned ${task.getLessonURL()} is its entirety!`
        } else {
            paragraph = score === 100 ? `You learned ${task.getHand()} of bars ${task.getStartBar()}-${task.getEndBar()}` : undefined
        }
    }


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
        <ScoreBar value={score} showValue={true} size={"medium"}></ScoreBar>
    </div>
    <div>
        {#if score < 100}
            <OptionButton text="Select Level" on:click={()=>{goto("lesson?lesson=" + task.getLessonURL())}}></OptionButton>
            <ReccomendedButton text="Retry" on:click={()=>{goto("game?" + task.queryString())}}></ReccomendedButton>
        {:else}
            {#if progress}
                {#if progress.next((t)=>{ return t.getLessonURL() === task.getLessonURL() })}
                    <OptionButton text="Select Level" on:click={()=>{goto("lesson?lesson=" + task.getLessonURL())}}></OptionButton>
                    <ReccomendedButton text="Next Level" on:click={()=>{goto("game?" + progress.next((t)=>{ return t.getLessonURL() === task.getLessonURL() }).queryString())}}></ReccomendedButton>
                {:else}
                    <OptionButton text="Home" on:click={()=>{goto("/")}}></OptionButton>
                    <ReccomendedButton text="New Lesson" on:click={()=>{goto("game?" + progress.next().queryString())}}></ReccomendedButton>
                {/if}
            {/if}
        {/if}
    </div>
</div>