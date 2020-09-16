<script>
    import { goto } from '@sapper/app';
    import { Fetcher } from '../../utils/util.js'
    export let fetcher = new Fetcher();

    export let youtubeID = "reLjhAAPsPc"
    let youtubeTitle = ""
    let lessonName = "Spaghet"
    $: {
        fetcher.fetch("get", "getYTAsset/title/" + youtubeID).then((res)=>{
            youtubeTitle = res === undefined ? "" : res.title
        }).catch(()=>{
            youtubeTitle = ""
        })
    }

    function handlesave() {
        fetcher.fetch("POST", ["api", "blakemscurr", lessonName, "new"].join("/"), {
            owner: "blakemscurr", // TODO: get from logged in user
            lessonName: lessonName,
            youtubeID: youtubeID,
            youtubeTitle: youtubeTitle,
        }).then(()=>{
           goto(["blakemscurr", lessonName, "edit"].join("/"))
        }).catch((err)=>{
            console.warn(err)
        })
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