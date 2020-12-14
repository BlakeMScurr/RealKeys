<script lang="ts">
    import { disableGlobalKeys, enableGlobalKeys, separator } from '../../lib/util'
    import { onMount } from 'svelte';

    export let loadNew;
    export let searchResults: Array<{path: string, name: string}> = [];
    export let searchQuery: string = "";

    $: {
        search(searchQuery)
    }

    // Search as the search query updates
    let f
    onMount(()=>{
        f = fetch
    })

    let searchTimeout: ReturnType<typeof setTimeout>;
    function search(searchQuery) {
        if (f !== undefined) {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(()=> {
                // Delay the search so that we don't hit the server too hard and have to wait too long for the most recent result we're actually interested in
                // TODO: try cancelling requests per https://stackoverflow.com/questions/31061838/how-do-i-cancel-an-http-fetch-request
                let req = {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                fetch("api/search?searchQuery=" + searchQuery, req).then((res) => {
                    return res.json()
                }).then((json) => {
                    searchResults = JSON.parse(json).map((item) => {return item.item})
                })
            }, 200)
        }
    }

    function handleClick (path){
        searchResults = []
        loadNew(path.replace(/\//g, separator))
    }

    
</script>

<style lang="scss">
    .navbar {
        width: 100%;
        h1 {
            display: inline;
        }

        .dropdown {
            position: relative;
            display: inline-block;
        }
    }


    .dropdown-content {
        display: block;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
    }

    .dropdown-content p {
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        margin: 0;
    }

    .dropdown-content p:hover {background-color: #f1f1f1}
</style>

<div class="navbar">
    <h1>RealKeys</h1>
    <!-- TODO: add a magnifying glass that one can search to get to a full results page -->
    <div class="dropdown">
        <input type="text" placeholder="Search for lessons..." bind:value={searchQuery} on:focus={disableGlobalKeys} on:focusout={enableGlobalKeys}>
        <div class="dropdown-content">
            {#each searchResults as result}
                <p on:click={ () => {handleClick(result.path)}}>{result.name}</p>
            {/each}
        </div>
    </div>
    <hr>
</div>

