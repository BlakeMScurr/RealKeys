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

    export let courseName;
    export let midiName;

    let t = ''

    onMount(() => {
        build(courseName).then(b => {
            if (b.curriculumNames.indexOf(midiName) === -1) {
                throw new Error(`${midiName} doesn't exist`)
            }

            // Tutorials (i.e., a non sequential sub curriculum) doesn't have a tasks page, we just go straight into the game
            if (!b.sequential.get(midiName)) {
                t = "this is a tutorial"
                goto(`/course/${courseName}/${midiName}/0`)
            }
        })
    })
</script>


<h1>{t}</h1>

