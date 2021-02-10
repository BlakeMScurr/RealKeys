<script lang="ts">
    import LockButton from "../components/Generic/Buttons/LockButton.svelte";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import { getLessons } from "../lib/lesson/data"
    import { stores } from "@sapper/app";
    import { hand, longNameSpeed, speed, taskSpec, urlToTask } from "../lib/lesson/lesson";
    import { state } from "../lib/lesson/lesson"
    import { goto } from '@sapper/app'
    import { get } from "../lib/util";

    const { page } = stores();
    const query = $page.query;
    let task: taskSpec = urlToTask(query)

    function gotoGame(s: speed, h: hand, start: number, end: number) {
        return () => {
            let t = new taskSpec(0, start, end, h, s, task.lesson)
            goto("game?" + t.queryString())
        }
    }

    let lessons;
    getLessons().subscribe((l) => {
        lessons = l
    })

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
        display: flex;
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
    <h2>{lessons.lessons[0].name}</h2>
    
    {#each lessons.lessons[0].sections as section}
        <div class="section">
            <div class="description">
                <h3>Bars {section.startBar}-{section.endBar}</h3>
                <div class="handholder">
                    {#each section.hands as hand}
                        <div class="hand">
                            <h4>{hand.hand}</h4>
    
                            {#each hand.speeds as speed}
                                <div class="task">
                                    <div>
                                        <p>{longNameSpeed(speed.speed)}</p>
                                        <ScoreBar value={speed.progress}></ScoreBar>
                                    </div>
                                    <div class="button">
                                        {#if speed.state === state.locked}
                                            <LockButton></LockButton>
                                        {:else if speed.state === state.allowed}
                                            <OptionButton text="Learn" on:click={gotoGame(speed.speed, hand.hand, section.startBar, section.endBar)}></OptionButton>
                                        {:else if speed.state === state.reccomended}
                                            <ReccomendedButton text="Learn" on:click={gotoGame(speed.speed, hand.hand, section.startBar, section.endBar)}></ReccomendedButton>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/each}
</div>
