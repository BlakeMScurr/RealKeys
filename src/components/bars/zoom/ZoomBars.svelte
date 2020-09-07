<script>
    import ZoomArea from "./ZoomArea.svelte"
    import Bars from "../Bars.svelte"
    import { createEventDispatcher } from 'svelte';

    export let bars;
    export let position;
    let start;
    let end;

    const dispatch = createEventDispatcher();
	function forward(event) {
		dispatch(event.type, event.detail);
	}
</script>

<ZoomArea bind:start={start} bind:end={end}></ZoomArea>
<Bars bars={bars} zoomStart={start} zoomEnd={end} bind:position={position} on:seek={forward} on:repeat={forward}></Bars>