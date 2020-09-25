<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import LessonLoader from '../../../components/lessons/LessonLoader.svelte';
    import Record from "../../../components/pages/Record.svelte";
    import { currentSong } from "../../../components/stores";
    import type { TimedNotes } from '../../../lib/music/timed/timed';

    export let owner;
    export let lessonID;

    currentSong.subscribe((notes: TimedNotes) => {
        console.log("fetching notes")
        fetch(["api", owner, lessonID, "updateNotes"].join("/"), {
            method: "POST",
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(notes)
        })
    })

    let renderComponent = Record

</script>

<LessonLoader {owner} {lessonID} {renderComponent}></LessonLoader>
