<script>
    import { goto } from '@sapper/app';
    import { Fetcher } from '../../lib/util.js'
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

    let backendError = "";
    function handlesave() {
        fetch(["api", "blakemscurr", lessonName, "new"].join("/"), {
            method: "POST",
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                owner: "blakemscurr", // TODO: get from logged in user
                lessonName: lessonName,
                youtubeID: youtubeID,
                youtubeTitle: youtubeTitle,
            })
        }).then((response)=>{
            if (response.status == 400) {
                return response.json()
            } else {
                goto(["blakemscurr", lessonName, "edit"].join("/"))
            }
        }).then((json)=>{
            if (json !== undefined && json.message !== undefined) {
                backendError = json.message
            }
        }).catch((err)=>{
            console.warn(err)
        })
    }

    // TODO: make input field component - this is very ugly and long considering that it basically does nothing
    function valid(id, title, name, backendError) {
        if (backendError != "") {
            return backendError
        }

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
    <input type="textarea" bind:value={lessonName} on:input={()=>{backendError = ""}}>
</label>
<br>
<label>
    YouTube ID
    <input type="textarea" bind:value={youtubeID} on:input={()=>{backendError = ""}}>
</label>
<p id="ytTitle">{youtubeTitle}</p>
<button disabled={valid(youtubeID, youtubeTitle, lessonName, backendError) == "" ? "" : "disabled"} on:click={handlesave}>New Lesson</button>
<p id="error">{valid(youtubeID, youtubeTitle, lessonName, backendError)}</p>