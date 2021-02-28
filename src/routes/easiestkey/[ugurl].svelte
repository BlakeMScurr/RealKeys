<script lang="ts">
    import { onMount } from "svelte";

    let got = false
    let transposeUp = 0
    onMount(async () => {
        fetch("api/ug").then(resp => {
            resp.json().then((json) => {
                got = true
                transposeUp = json.transposeUp
            })
        })
    })
</script>

{#if got}
    <h2>{transposeUp}</h2>
    <h2>Go back to ultimate guitar the tranpose up button {transposeUp} times</h2>
{/if}