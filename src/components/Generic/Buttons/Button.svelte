<script lang="ts">
    import ReccomendedButton from "./ReccomendedButton.svelte";
    import OptionButton from "./OptionButton.svelte";
    import { createEventDispatcher } from "svelte";

    export let text: string;
    export let reccomended: boolean = false;

    let dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail)
    }
</script>

{#if reccomended}
    <ReccomendedButton {text} defaultAction={true} on:click={forward}></ReccomendedButton>
{:else}
    <OptionButton {text} on:click={forward}></OptionButton>
{/if}