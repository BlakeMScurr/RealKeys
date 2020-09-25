<script context="module">
	export function preload(page) {
		return { 
            owner: page.params.owner,
            lessonID: page.params.lessonID,
        }
	}
</script>

<script>
    import LessonLoader from '../../../components/lessons/LessonLoader.svelte';
    import Record from "../../../components/pages/Record.svelte";

    export let owner;
    export let lessonID;

    let renderComponent = Record

    // TODO: implement
    function handleSave(event) {
    //     switch (event.type) {
    //         case 'save':
    //             fetch(["api", owner, lessonID, "save"].join("/"), {
    //                 method: "POST",
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Accept': 'application/json'
    //                 },
    //                 body: JSON.stringify(event.detail),
    //             }).then(()=>{
    //                 // TODO: show on the UI somewhere
    //                 console.log("saved")
    //             }).catch((err)=>{
    //                 console.log("failed to save:", err)
    //             })
    //     }
    }
</script>

<LessonLoader {owner} {lessonID} {renderComponent} on:save={handleSave}></LessonLoader>