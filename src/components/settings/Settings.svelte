<script lang="ts">
    import { speedStore, waitMode } from "../../stores/stores"
    import Slider from "../slider/Slider.svelte";

    export let bars;
    export let timesignatures;

    let waitModeOn:boolean = false
    waitMode.subscribe((val) => {
        waitModeOn = val
    })

    function waitModeChange() {
        waitMode.set(waitModeOn)
    }

    let speed: number = 1
    $: {
        speedStore.set(speed)
    }
</script>

<style lang="scss">
    .slider {
        max-width: 100px;
        p {
            margin: 0;
        }
    }
</style>

<!-- TODO: pretty symbols, or at least buttons -->
<label for="waitModeOn">Wait Mode</label>
<input type="checkbox" id="waitModeOn" bind:checked={waitModeOn} on:change={waitModeChange}>
<div class="slider">
    <p>Speed {Math.round(speed * 100)}%</p>
    <Slider min={0.1} max={1} step={0.01} bind:value={speed}></Slider>
</div>