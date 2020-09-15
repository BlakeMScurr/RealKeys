<script>
    import { Fetcher } from '../../utils/util.js'
    export let fetcher = new Fetcher();

    let youtubeID = ""
    let youtubeTitle = ""
    $: {
        fetcher.fetch("POST", "getYTAsset/title/" + youtubeID).then((res)=>{
            youtubeTitle = res === undefined ? "" : res.title
        }).catch(()=>{
            youtubeTitle = ""
        })
    }
</script>

<label>
    YouTube ID
    <input type="textarea" bind:value={youtubeID}>
</label>
<p>{youtubeTitle}</p>