<script context="module">
	export async function preload(page) {
		const { courseName, midiName, taskIndex } = page.params;
		return { courseName: courseName, midiName: midiName, taskIndex: taskIndex };
	}
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import Game from "../../../../components/Game.svelte";
    import type { Curriculum } from "../../../../lib/gameplay/curriculum/curriculum";
    import { build } from "../../../../lib/gameplay/curriculum/methodology/builder";
    import type { task } from "../../../../lib/gameplay/curriculum/task";
    import { goto } from "@sapper/app"
    import { writable } from "svelte/store";

    export let courseName;
    export let midiName;
    export let taskIndex;

    let taskPromise = new Promise<[task, string, Curriculum]>(()=>{})
    onMount(() => {
        taskPromise = tp(taskIndex)
    })

    function tp(i):Promise<[task, string, Curriculum]> {
        return build(courseName).then((bp) => {
            let c = bp.Curriculum()
            return [c.getLesson(midiName)[i], bp.sections.get(midiName)[i].text, c]
        })
    }

    let forward = writable(null)
</script>

{#await taskPromise then gameDesc}
    <Game currentTask={gameDesc[0]} text={gameDesc[1]} {courseName} {forward} curriculum={gameDesc[2]} next={()=>{
        let next = parseInt(taskIndex)+1
        if (gameDesc[2].getLesson(midiName).length > next) {
            goto(`/course/${courseName}/${midiName}/${next}`);
    
            // TODO: we should update the content in such a way that we don't actually flash everything
            // taskPromise = tp(next);
            tp(next).then((gd) => {
                forward.set(gd)
            })
        } else {
            goto(`course/${courseName}`)
        }
    }}></Game>
{/await}