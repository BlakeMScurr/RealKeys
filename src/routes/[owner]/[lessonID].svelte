<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script>
    import LessonLoader from '../../components/lessons/LessonLoader.svelte';
    import AudioPlayer from '../../components/AudioPlayer.svelte';

    export let owner;
    export let lessonID;

    // TODO: don't show edit stuff
    let renderComponent = AudioPlayer;
</script>

<LessonLoader {owner} {lessonID} {renderComponent}></LessonLoader>