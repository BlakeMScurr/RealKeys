<script context="module">
	export async function preload(page, session) {
		const { user, tabname } = page.params;
		return { user: user, tabname: tabname };
	}
</script>

<style>
    h1 {
        text-align: center;
        font-size: 40px;
    }

    p {
        text-align: center;
    }
</style>

<script lang="ts">
    // TODO: show an error if we couldn't find the song
    // TODO: tell that we don't know a given chord
    import { onMount } from "svelte";

    export let user;
    export let tabname;

    let transposeUp = -1
    let error = ""
    onMount(() => {
        fetch("api/ug?path=" + user + "/" + tabname).then(resp => {
            resp.json().then((json) => {
                if (typeof json.transposeUp !== "undefined") {
                    transposeUp = json.transposeUp
                }
                if (typeof json.error !== "undefined") {
                    error = json.error
                }
            })
        })
    })
</script>

{#if transposeUp !== -1}
    <h1>Tranpose up {transposeUp}</h1>
{/if}

{#if error !== ""}
    <h1>Sorry, we couldn't simplify your chords :/</h1>
    <p>{error}</p>
{/if}