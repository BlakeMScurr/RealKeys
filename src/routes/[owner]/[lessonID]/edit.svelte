<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script>
    import { onMount } from 'svelte';
    import AudioPlayer from '../../../components/AudioPlayer.svelte';

    export let owner;
    export let lessonID;

    async function getLessonDefinition() {
        let res = await fetch(["api", owner, lessonID, "get"].join("/"), {
            method: "GET",
        })
        return await res.json()
    }

    function handleSave(lesson) {
        return function (event) {
            switch (event.type) {
                case 'save':
                    let newLesson = {
                        ...lesson,
                    ...event.detail,
                    }

                    fetch(["api", owner, lessonID, "save"].join("/"), {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(newLesson),
                    }).then(()=>{
                        // TODO: show on the UI somewhere
                        console.log("saved")
                    }).catch((err)=>{
                        console.log("failed to save:", err)
                    })
            }
        }
    }
</script>

{#await getLessonDefinition()}
    <h1>Loading</h1>
{:then lesson}
    <h1>{lesson.lesson_name}</h1>
    <AudioPlayer videoID={lesson.youtube_id} on:save={handleSave(lesson)}></AudioPlayer>
{:catch}
    <h1>Could not load lesson</h1>
{/await}