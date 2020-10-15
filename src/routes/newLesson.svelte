<!-- TODO: way nicer styling -->
<script lang="ts">
    import { getCookie, joinURL } from "../lib/util";
    import Login from "../components/generic/Login.svelte"
    import Spotify from "../components/audioplayer/Spotify.svelte";

    let token = getCookie("token", document.cookie)

    let selected = false
    let songNameQuery: string = "Jesus Walks";
    let searchResults = [];
    // TODO: allow infinite scroll with pagination
    function handleSpotifySearch() {
        selected = false
        if (songNameQuery != "") {
            var url = new URL('https://api.spotify.com/v1/search')
            let params = {q: songNameQuery, type: "track"}
            url.search = new URLSearchParams(params).toString();
            fetch(url, {
                method: "GET",
                headers: {
                    'Accept': "application/json",
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                }
            }).then((res) => {
                return res.json()
            }).then((json) => {
                if (json.error != undefined) {
                    token = undefined
                } else {
                    searchResults = []
                    json.tracks.items.forEach(track => {
                        searchResults.push({artists: track.artists, name: track.name, id: track.id})
                    });
                }
            })
        }
    }
    handleSpotifySearch()
    const randishString = "hfjdscvlkjbwlkjebr"

    let lessonName = ""
    function handleSelect(song) {
        return function () {
            searchResults = [song]
            selected = true
            lessonName = song.name
        }
    }

    function handleSave() {
        if (searchResults.length != 1) {
            throw new Error("expected a single selected search result when saving")
        }

        let id = searchResults[0].id

        console.log("saving", lessonName, id)

        // fetch(joinURL(["api", "blakemscurr", lessonName, "new"]), {
        //     method: "POST",
        //       headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         lessonName: "blakemscurr/" + lessonName, // TODO: get from logged in user
        //         youtubeID: youtubeID,
        //         youtubeTitle: youtubeTitle,
        //     })
        // }).then((response)=>{
        //     if (response.status == 400) {
        //         return response.json()
        //     } else {
        //         goto(joinURL(["blakemscurr", lessonName, "beats"]))
        //     }
        // }).then((json)=>{
        //     if (json !== undefined && json.message !== undefined) {
        //         backendError = json.message
        //     }
        // }).catch((err)=>{
        //     console.warn(err)
        // )}
        }
</script>

<style lang="scss">
    .result {
        border: 1px solid grey;
        margin: 2px;
        padding: 5px;

        &:hover {
            background-color: #667ED4;
            cursor: pointer;
            color: white;
        }

        h3 {
            margin: 0;
        }

        p {
            margin: 0;
        }

        input {
            margin: 5px;
        }
    }
</style>

{#if token === undefined}
    <Login></Login>
{:else}
    Song Name
    <input type="textarea" bind:value={songNameQuery} on:input={handleSpotifySearch}>

    {#each searchResults as result}
        <div class="result" on:click={handleSelect(result)}>
            <div>
                <h3>{result.name}</h3>
            </div>
            <p>
                {#each result.artists.map((artist)=>{return artist.name}).join(", " + randishString).split(randishString) as name}
                    {name}
                {/each}
            </p>
        </div>
    {/each}

    {#if selected}
        Lesson Name
        <input type="textarea" bind:value={lessonName}>
        <Spotify track={searchResults[0].id}></Spotify>
        <button on:click={handleSave}>Create Lesson</button>
    {/if}
{/if}