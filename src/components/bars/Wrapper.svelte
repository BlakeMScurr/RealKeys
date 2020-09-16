<script>
    import ZoomBars from "./zoom/ZoomBars.svelte"
    import EditBars from "./edit/EditBars.svelte"
    import { createEventDispatcher } from 'svelte';

    export let bars;
    export let position;
    export let songLength;

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

{#if edit}
    <EditBars bind:bars={bars} position={position} songLength={songLength} on:seek={forward} on:repeat={forward}></EditBars>
    <button on:click={handleClick}>Save</button>
{:else}
    <ZoomBars bars={bars} bind:position={position} on:seek={forward} on:repeat={forward}></ZoomBars>
    <button on:click={()=>{edit=true}}>Edit</button>
{/if}

