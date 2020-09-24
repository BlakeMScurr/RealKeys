<script>
    import ZoomBars from "./zoom/ZoomBars.svelte"
    import EditBars from "./edit/EditBars.svelte"
    import { createEventDispatcher } from 'svelte';

    export let bars;
    export let position;
    export let songLength;
    export let editable = true;

    let edit = false;

    const dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail);
    }

    function handleClick() {
        edit = false
        dispatch("save", {
            bars: bars,
        })
    }
</script>

<!-- TODO: push the content in the wrapper up to the top level, it's just markup essentially, and doesn't belong in a component,
but rather belongs in a route so that we can more easily see the whole structure of the page -->
{#if edit}
    <EditBars bind:bars={bars} position={position} songLength={songLength} on:seek={forward} on:repeat={forward}></EditBars>
    <button on:click={handleClick}>Save</button>
{:else}
    <ZoomBars bars={bars} bind:position={position} on:seek={forward} on:repeat={forward}></ZoomBars>
    {#if editable}
        <button on:click={()=>{edit=true}}>Edit</button>
    {/if}
{/if}

