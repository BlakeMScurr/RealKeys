<script>
    import { Fetcher } from '../../utils/util.js'
    export let fetcher = new Fetcher();

    export let youtubeID = ""
    let youtubeTitle = ""
    let lessonName = ""
    $: {
        fetcher.fetch("POST", "getYTAsset/title/" + youtubeID).then((res)=>{
            youtubeTitle = res === undefined ? "" : res.title
        }).catch(()=>{
            youtubeTitle = ""
        })
    }

    function handlesave() {

    }

    // TODO: make input field component
    function valid(id, title, name) {
        if (id == "") {
            return "YouTube ID Required"
        }

        if (title == "") {
            return "Valid YouTube ID required"
        }

        if (name == "") {
            return "Lesson name required"
        }

        return ""
    }
</script>

<style>
    #ytTitle {
        color: grey;
    }

    #error {
        color: red;
    }
</style>

<label>
    Lesson Name
    <input type="textarea" bind:value={lessonName}>
</label>
<br>
<label>
    YouTube ID
    <input type="textarea" bind:value={youtubeID}>
</label>
<p id="ytTitle">{youtubeTitle}</p>
<button disabled={valid(youtubeID, youtubeTitle, lessonName) == "" ? "" : "disabled"} on:click={handlesave}>New Lesson</button>
<p id="error">{valid(youtubeID, youtubeTitle, lessonName)}</p>