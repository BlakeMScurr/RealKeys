<script lang="ts">
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import { stores } from "@sapper/app";
    import { goto } from '@sapper/app'
    import { getProgress } from "../lib/storage";
    import { onMount } from "svelte";
    import { describeHand } from "../lib/gameplay/curriculum/task";
    import type { task } from "../lib/gameplay/curriculum/task";
    import { splitByHand, splitBySection } from "../lib/gameplay/curriculum/curriculum";
    import type { Curriculum } from "../lib/gameplay/curriculum/curriculum";
import { defaultLessons } from "../lib/gameplay/curriculum/data";

    const { page } = stores();
    const query = $page.query;

    let lesson: Array<task> = []
    let curric: Curriculum;
    onMount(()=>{
        curric = getProgress(defaultLessons())
        lesson = curric.getLesson(query.lesson)
    })

    function gotoTask(t: task) {
        return () => {
            goto("game?" + t.queryString())
        }
    }
</script>

<style lang="scss">
    p {
        display: inline-block;
        margin: 0;
    }

    h4 {
        margin: 0;
        margin-top: 15px;
    }

    .task {
        display: flex; // TODO: display: grid;
        justify-content: space-between;
        margin-bottom: 7px;
        padding-left: 15px;

        .button {
            align-self: center;
        }
    }

    .handholder {
        display:flex;
        justify-content: space-around;
        flex-wrap: wrap;
        .hand {
            flex-grow: 1;
            max-width: 250px;
            min-width: 250px;
            margin-right: 15px;
        }
    }


    .layout {
        padding: 0px 30px 30px 30px;
    }
</style>

<div class="layout">
    <h2>{query.lesson}</h2>
    
    {#each splitBySection(lesson) as section}
        {#if section.length > 0}
        <div class="section">
            <div class="description">
                <h3>Bars {section[0].getStartBar()}-{section[0].getEndBar()}</h3>
                <div class="handholder">
                    {#each splitByHand(section) as hand}
                        <div class="hand">
                            <h4>{describeHand(hand[0].getHand())}</h4>
    
                            {#each hand as speed}
                                <div class="task">
                                    <div>
                                        <p>{speed.getMode().description()}</p>
                                        <ScoreBar value={curric.getScore(speed)}></ScoreBar>
                                    </div>
                                    <div class="button">
                                        {#if !curric.unlocked(speed)}
                                            <OptionButton text="Try" on:click={gotoTask(speed)}></OptionButton>
                                        {:else if curric.getScore(speed) == 100}
                                            <OptionButton text="Practice" on:click={gotoTask(speed)}></OptionButton>
                                        {:else}
                                            <ReccomendedButton text="Learn" on:click={gotoTask(speed)}></ReccomendedButton>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        {/if}
    {/each}
</div>
