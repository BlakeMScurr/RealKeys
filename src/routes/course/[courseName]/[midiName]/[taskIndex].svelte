<script context="module">
	export async function preload(page) {
		const { courseName, midiName, taskIndex } = page.params;
		return { courseName: courseName, midiName: midiName, taskIndex: taskIndex };
	}
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import Game from "../../../../components/Game.svelte";
    import { build } from "../../../../lib/gameplay/curriculum/methodology/builder";
    import type { task } from "../../../../lib/gameplay/curriculum/task";

    export let courseName;
    export let midiName;
    export let taskIndex;

    let taskPromise = new Promise<task>(()=>{})
    onMount(() => {
        taskPromise = build(courseName).then((bp) => {
            return bp.Curriculum().getLesson(midiName)[taskIndex]
        })
    })
</script>

{#await taskPromise then currentTask}
    <Game {currentTask} {courseName}></Game>
{/await}


