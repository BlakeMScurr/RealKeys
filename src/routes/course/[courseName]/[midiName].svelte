<script context="module">
	export async function preload(page) {
		const { courseName, midiName } = page.params;
		return { courseName: courseName, midiName: midiName };
	}
</script>

<script lang="ts">
    import { goto } from "@sapper/app";
    import { onMount } from "svelte";
    import { build } from "../../../lib/gameplay/curriculum/methodology/builder";
    import { methodologyName } from "../../../lib/gameplay/curriculum/methodology/methodology";

    export let courseName;
    export let midiName;

    onMount(() => {
        build(courseName).then(b => {
            let c = b.Curriculum()
            let lesson = c.getLesson(midiName)
            if (lesson.length === 0) {
                throw new Error(`${midiName} doesn't exist`)
            }

            // Tutorials don't have a tasks page, we just go straight into the game
            if (lesson[0].getMethodology() === methodologyName.tutorial) {
                goto(`/course/${courseName}/${midiName}/0`)
            }
        })
    })
</script>
