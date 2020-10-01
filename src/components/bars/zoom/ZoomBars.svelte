<script>
    import ZoomArea from "./ZoomArea.svelte"
    import Bars from "../Bars.svelte"
    import { createEventDispatcher } from 'svelte';

    export let bars;
    // TODO: remove prop, as we're just using the store now
    let start;
    let end;

    // TODO: use store for repeat and seek
    const dispatch = createEventDispatcher();
	function forward(event) {
		dispatch(event.type, event.detail);
	}
</script>

<!-- TODO: move left/right on position update to keep the position bar in view -->
<ZoomArea bind:start={start} bind:end={end}></ZoomArea>
<Bars bars={bars} zoomStart={start} zoomEnd={end} on:seek={forward} on:repeat={forward}></Bars>