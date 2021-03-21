<script context="module">
	export async function preload(page, session) {
		const { courseName } = page.params;
		return { courseName: courseName };
	}
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import ReccomendedButton from "../../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreCircle from "../../components/Generic/ScoreCircle.svelte";
    import { splitByName } from "../../lib/gameplay/curriculum/curriculum";
    import type { Curriculum } from "../../lib/gameplay/curriculum/curriculum";
    import { blueprints, build } from "../../lib/gameplay/curriculum/methodology/builder";
    import OptionButton from "../../components/Generic/Buttons/OptionButton.svelte";
    import { goto } from "@sapper/app";
    import type { task } from "../../lib/gameplay/curriculum/task";
    import { methodologyName } from "../../lib/gameplay/curriculum/methodology/methodology";
    import { getProgress } from "../../lib/storage";
    import ScoreBar from "../../components/Generic/ScoreBar.svelte";

    export let courseName;

    let blueprintsPromise = new Promise<[Curriculum, blueprints]>(()=>{});

    onMount(() => {
        blueprintsPromise = build(courseName).then((b) => {
            return [getProgress(b.Curriculum()), b]
        })
    })

    function gotoSubcurriculum(t: task) {
        return () => {
            let taskUrl = "/course/" + courseName + "/" + t.getLessonURL()
            if (t.getMethodology() === methodologyName.tutorial) taskUrl += "/0"
            goto(taskUrl)
        }
    }

    function averageScore(c: Curriculum, tasks: Array<task>):number {
        return tasks.reduce((sum: number, t: task):number => {
            return sum + c.getScore(t) / tasks.length
        }, 0)
    }
</script>

<style lang="scss">

    $column: 300px;
    div {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        grid-column-gap: 10%;
        grid-row-gap: 14px;
        padding: 28px;

        div {
            padding: 0;
            background-color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            grid-column-gap: 3px;
            grid-row-gap: 0px;
            justify-content: space-between;

            .vert {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                h4 {
                    margin: 0;
                }
            }
        }
    }
</style>

<!-- TODO: paramaterise -->
<h2>Basic Chords</h2>

{#await blueprintsPromise then bp }
    <div>
        {#each bp[1].curriculumNames.map((n) => { return bp[0].getLesson(n)}) as lesson}
            <div>
                <!-- TODO: replace lesson[0] by aggregating the average scores of the lessons - should be an easy reduce function -->
                <div class="vert">
                    <h4>{lesson[0].getLessonURL()}</h4>
                    <ScoreBar value={averageScore(bp[0], lesson)}></ScoreBar>
                </div>

                {#if bp[0].unlocked(lesson[0])}
                    {#if averageScore(bp[0], lesson) === 100}
                        <OptionButton text="Practice" on:click={gotoSubcurriculum(lesson[0])}></OptionButton>
                    {:else}
                        <ReccomendedButton text="LEARN" on:click={gotoSubcurriculum(lesson[0])}></ReccomendedButton>
                    {/if}
                {:else}
                    <OptionButton text="TRY" on:click={gotoSubcurriculum(lesson[0])}></OptionButton>
                {/if}
            </div>
        {/each}
    </div>
{/await}
