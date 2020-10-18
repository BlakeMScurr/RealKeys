<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script lang="ts">
    import EditBars from '../../../components/bars/edit/EditBars.svelte';
    import ZoomBars from '../../../components/bars/zoom/ZoomBars.svelte';
    import { getLessonDefinition } from '../../../lib/api.js'
    import Spotify from '../../../components/audioplayer/Spotify.svelte';

    export let owner;
    export let lessonID;

    let edit = false;

    let newBars
    function handleNewBars(event) {
        newBars = event.detail
    }

    function save(lesson) {
        return function () {
            edit = false
            lesson.bars = newBars
            lesson.lesson_name = owner + "/" + lessonID

            fetch(["api", owner, lessonID, "save"].join("/"), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(lesson),
            }).then(()=>{
                // TODO: show on the UI somewhere
                console.log("saved")
            }).catch((err)=>{
                console.log("failed to save:", err)
            })

            newBars = undefined
        }
    }
    
    function dismiss() {
        newBars = undefined
    }
</script>

{#await getLessonDefinition(owner, lessonID)}
    <h1>Loading</h1>
{:then lesson}
    <h1>{lessonID}</h1>
    <h3>{owner}</h3>

    <Spotify track={lesson.spotify_id}></Spotify>
    {#if edit}
        <EditBars bars={lesson.bars} on:newBars={handleNewBars}></EditBars>
    {:else}
        <ZoomBars bars={lesson.bars}></ZoomBars>
        <button on:click={()=>{edit = true}}>Edit</button>
    {/if}

    {#if newBars !== undefined}
        <button on:click={save(lesson)}>Save</button>
        <button on:click={dismiss}>Dismiss</button>
    {/if}
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {error}</h1>
{/await}