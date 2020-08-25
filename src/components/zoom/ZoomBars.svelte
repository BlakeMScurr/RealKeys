<script>
    import ZoomArea from "./ZoomArea.svelte"
    import Bars from "../bars/Bars.svelte"

    export let bars;
    let start;
    let end;
</script>

<ZoomArea bind:start={start} bind:end={end}></ZoomArea>
<Bars {bars} zoomStart={start} zoomEnd={end}></Bars>