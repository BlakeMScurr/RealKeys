<script>
    import ZoomArea from "./ZoomArea.svelte"
    import Bars from "../bars/Bars.svelte"
    import { createEventDispatcher } from 'svelte';

    export let bars;
    export let position;
    let start;
    let end;

    const dispatch = createEventDispatcher();
	function forward(event) {
		dispatch('seek', event.detail);
	}
</script>

<ZoomArea bind:start={start} bind:end={end}></ZoomArea>
<Bars bars={bars} zoomStart={start} zoomEnd={end} bind:position={position} on:seek={forward}></Bars>