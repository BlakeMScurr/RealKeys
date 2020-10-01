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
    import EditBars from '../../../components/bars/edit/EditBars.svelte';
    import ZoomBars from '../../../components/bars/zoom/ZoomBars.svelte';
    import { getLessonDefinition } from '../../../lib/api.js'
    import { NewYouTubeAudioPlayer } from "../../../components/audioplayer/audioplayer.ts"
    import AudioPlayer from "../../../components/audioplayer/AudioPlayer.svelte"

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
    {#await NewYouTubeAudioPlayer(lesson.youtube_id)}
        Loading Audio
    {:then audioPlayer}
        <!-- TODO: don't call NewYouTubeAudioPlayer -->
        <AudioPlayer AudioPlayerPromise={NewYouTubeAudioPlayer(lesson.youtube_id)}></AudioPlayer>
        {#if edit}
            <EditBars bars={lesson.bars} songLength={audioPlayer.Duration()} on:newBars={handleNewBars}></EditBars>
        {:else}
            <ZoomBars bars={lesson.bars}></ZoomBars>
            <button on:click={()=>{edit = true}}>Edit</button>
        {/if}

        {#if newBars !== undefined}
            <button on:click={save(lesson)}>Save</button>
            <button on:click={dismiss}>Dismiss</button>
        {/if}
    {/await}
{:catch error}
    <h1>Could not load lesson {owner}/{lessonID} {error}</h1>
{/await}