<script context="module">
	export async function preload(page, session) {
		const { name } = page.params;
		return { name: name };
	}
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import ReccomendedButton from "../../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreCircle from "../../components/Generic/ScoreCircle.svelte";
    import { splitByName } from "../../lib/gameplay/curriculum/curriculum";
    import type { Curriculum } from "../../lib/gameplay/curriculum/curriculum";
    import type { section } from "../../lib/gameplay/curriculum/builder";
    import { PieceBreakdown, SequentialCurriculum } from "../../lib/gameplay/curriculum/methodology/sequential";
    import { mapStringifyReviver } from "../../lib/util";
    import { tutorial } from "../../lib/gameplay/curriculum/methodology/tutorial";
    import type { modeName } from "../../lib/gameplay/mode/mode";
    import { compose } from "../../lib/gameplay/curriculum/methodology/compose";
    import { graph } from "../../lib/math/graph";
    import OptionButton from "../../components/Generic/Buttons/OptionButton.svelte";
import type { task } from "../../lib/gameplay/curriculum/task";

    export let name;

    let curriculumPromise = new Promise<Curriculum>(()=>{});

    onMount(() => {
        curriculumPromise = fetch("api/course?name=" + name).then((f) => {
            return f.text()
        }).then((f) => {
            // TODO: move to builder.ts
            let j = JSON.parse(f, mapStringifyReviver)
            let sections: Map<string, Array<section>> = j.sections
            let curriculumNames: Array<string> = j.curriculae
            let deps:  Array<[number, number]> = j.deps
            let sequential: Map<string, boolean> = j.sequential
            console.log(sequential)

            let curriculae: Array<Curriculum> = []
            curriculumNames.forEach((name) => {
                if (sequential.get(name)) {
                    let breakPoints = new Array<Array<number>>();
                    breakPoints[0] = sections.get(name).map((section) => {
                        return section.endBar
                    })
                    breakPoints[0].unshift(1) // add the first bar
                    breakPoints[1] = [1, breakPoints[0][breakPoints[0].length-1]] // section for the whole piece
                    curriculae.push(new SequentialCurriculum([new PieceBreakdown(name, breakPoints)]).curriculum())
                } else {
                    // TODO: remove this +1 thing, seems bad
                    // TODO: why does it think the type could is Array<[number | modeName]> if I don't just force it? (the difference being | vs ,)
                    let tutSecs: Array<[number, modeName]> = sections.get(name).map((section)=>{return [section.endBar + 1, section.mode]})
                    curriculae.push(new tutorial(name, tutSecs).curriculum())
                }
            })

            let course = compose(curriculae, new graph(deps).dag())
            return course
        })
    })

    function testDeps(c: Curriculum, lesson: Array<task>) {
        lesson.forEach((l) => {
            c.recordScore(l, 100)
        });
        curriculumPromise = new Promise((resolve) => { resolve(c)});
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
                        <OptionButton text="Practice" on:click={()=>{testDeps(curriculum, lesson)}}></OptionButton>
                    {:else}
                        <ReccomendedButton text="LEARN" on:click={()=>{testDeps(curriculum, lesson)}}></ReccomendedButton>
                    {/if}
                {:else}
                    <OptionButton text="TRY" on:click={()=>{testDeps(curriculum, lesson)}}></OptionButton>
                {/if}
            </div>
        {/each}
    </div>
{/await}
