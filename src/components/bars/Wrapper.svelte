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
</script>

{#if edit}
    <EditBars bind:bars={bars} position={0} songLength={songLength}></EditBars>
    <button on:click={()=>{edit=false}}>Save</button>
{:else}
    <ZoomBars bars={bars} bind:position={position} on:seek={forward} on:repeat={forward}></ZoomBars>
    <button on:click={()=>{edit=true}}>Edit</button>
{/if}

