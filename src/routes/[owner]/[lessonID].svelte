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
    import AudioPlayer from '../../components/AudioPlayer.svelte';

    export let owner;
    export let lessonID;

    let lesson;
    onMount(()=> {
        fetch(["api", owner, lessonID, "get"].join("/"), {
            method: "GET",
        }).then((res)=>{
            return res.json()
        }).then((json)=>{
            lesson = json
        })
    })

</script>

{#if lesson == undefined}
    <h1>Loading</h1>
{:else}
    <h1>{lesson.lesson_name}</h1>
    <!-- TODO: disable editing -->
    <AudioPlayer videoID={lesson.youtube_id} bars={lesson.bars}></AudioPlayer>
{/if}