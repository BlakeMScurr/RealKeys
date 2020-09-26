<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { currentSong } from "../../../components/stores";
    import type { TimedNotes } from '../../../lib/music/timed/timed';
    import LessonLoader from '../../../components/lessons/LessonLoader.svelte';
    import Record from "../../../components/pages/Record.svelte";
    import { joinURL } from '../../../lib/util';

    export let owner;
    export let lessonID;

    onMount(()=>{
        let loads = 0;
        currentSong.subscribe((notes: TimedNotes) => {
            // Don't update the notes in the db for the initial value of the store
            if (loads > 0) {
                fetch(joinURL(["api", owner, lessonID, "updateNotes"]), {
                    method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(notes)
                })
            }
            loads++
        })
    })

    let renderComponent = Record

</script>

<LessonLoader {owner} {lessonID} {renderComponent}></LessonLoader>
