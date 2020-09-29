<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { NewYouTubeAudioPlayer } from '../audioplayer/audioplayer.ts'
    import { joinURL } from '../../lib/util';

    export let owner;
    export let lessonID;
    export let renderComponent;
    export let renderProps;
    
    
    async function getLessonDefinition() {
        let res = await fetch(joinURL(["api", owner, lessonID, "get"]), {
            method: "GET",
        })
        return await res.json()
    }

    const dispatch = createEventDispatcher();
    function forward(lesson) {
        return function(event) {
            dispatch(event.type, {
                ...lesson,
                ...event.detail,
            });
        }
    }
</script>

{#await getLessonDefinition()}
    <h1>Loading</h1>
{:then lesson}
    <h1>{lesson.lesson_name}</h1>
    <svelte:component this={renderComponent} videoID={lesson.youtube_id} bars={lesson.bars} notes={lesson.notes} on:save={forward(lesson)} {...renderProps} AudioPlayerPromise={NewYouTubeAudioPlayer(lesson.youtube_id)}></svelte:component>
{:catch}
    <h1>Could not load lesson {owner}/{lessonID}</h1>
{/await}