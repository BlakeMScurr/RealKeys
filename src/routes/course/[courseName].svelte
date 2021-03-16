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
    import { build } from "../../lib/gameplay/curriculum/methodology/builder";
    import OptionButton from "../../components/Generic/Buttons/OptionButton.svelte";
    import { goto } from "@sapper/app";
    import type { task } from "../../lib/gameplay/curriculum/task";
import { methodologyName } from "../../lib/gameplay/curriculum/methodology/methodology";

    export let courseName;

    let curriculumPromise = new Promise<Curriculum>(()=>{});

    onMount(() => {
        curriculumPromise = build(courseName).then((b) => {
            return b.Curriculum()
        })
    })

    function gotoSubcurriculum(t: task) {
        return () => {
            let taskUrl = "/course/" + courseName + "/" + t.getLessonURL()
            if (t.getMethodology() === methodologyName.tutorial) taskUrl += "/0"
            goto(taskUrl)
        }
    }
</script>

<style lang="scss">

    $column: 300px;
    div {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        grid-column-gap: 28px;
        grid-row-gap: 7px;
        padding: 14px;

        div {
            padding: 0;
            display: grid;
            grid-template-columns: 10fr 1fr 1fr;
            align-items: center;
            grid-column-gap: 3px;

            div {
                display: inline-block;
                text-align: right;
            }
        }
    }
</style>

<!-- TODO: paramaterise -->
<h2>Basic Chords</h2>

{#await curriculumPromise then curriculum }
    <div>
        {#each splitByName(Array.from(curriculum.getTasks().keys())) as lesson}
            <div>
                <!-- TODO: replace lesson[0] by aggregating the average scores of the lessons - should be an easy reduce function -->
                <h3>{lesson[0].getLessonURL()}</h3>
                <ScoreCircle></ScoreCircle>
                {#if curriculum.unlocked(lesson[0])}
                    {#if curriculum.getScore(lesson[0]) === 100}
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
