<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script>

    export let owner;
    export let lessonID;

    // TODO: don't show edit stuff
    // let renderComponent = AudioPlayer;
    let renderProps = { editable: false }
</script>


{owner + "/" + lessonID}